# any-db-transaction

*note:* Generally you will not want to use this package directly, it is primarily
intended to simplify writing an Any-DB adapter that supports transactions.

## Description

Transaction objects are created by [Connection.begin][] and [Pool.begin][]. They
are simple wrappers around a [Connection][] that implement the same API, but
ensure that all queries take place within a single database transaction.

Any queries that error during a transaction will cause an automatic rollback. If
a query has no callback, the transaction will also handle (and re-emit)
`'error'` events for that query. This enables handling errors for an entire
transaction in a single place.

Transactions also implement their own [begin method][] for creating nested
transactions using savepoints. Nested transaction can safely error and rollback
without rolling back their parent transaction.

## API

```ocaml
Transaction := StateMachine & {
  adapter:  String
  query:    (String, Array?, Continuation<ResultSet>) => Query
  begin:    (String?, Continuation<Transaction>) => Transaction
  commit:   (Continuation?) => void
  rollback: (Continuation?) => void
}
```

### Transaction.adapter

Contains the adapter name used for the transaction, e.g. `'sqlite3'`, etc.

### Transaction states

Transactions are finite state machines with 4 states: `disconnected`,
`connected`, `open`, and `closed`:

    [disconnected]
          ↓
     [connected]
       ↓  ↓  ↑
       ↓ [open]
       ↓   ↓
      [closed]

Every transaction starts out in the `disconnected` state, in which it will queue
all tasks (queries, child transactions, commits and rollbacks) in the order they
are received.

Once the transaction acquires a connection\* it will transition to the
`connected` state and begin processing it's internal task queue. While in this
state any new tasks will still be added to the end of the queue. There are two
possible transitions from the `connected` state:

 * `connected → open` - When all queued tasks have finished.
 * `connected → closed` - When a rollback or commit is encountered in the queue.
   This includes automatic rollbacks caused by query errors.

`closed` is a terminal state in which all further database operations result in
errors. (The errors will either be sent to any callback provided or emitted as
`error` events on the next tick).

In the `open` state, all database operations will be performed immediately. If
a child transaction is started with [Transaction.begin][], the parent
transaction will move back into the `connected` state (queueing any queries it
receives) until the child completes, at which point it will resume processing
it's own internal queue.

*\ * - Transactions started from [Connection.begin][] transition
to `connected` before the transaction is returned from `.begin`.*

### Transaction.query

```ocaml
(text: String, params: Array?, Continuation<Result>?) => Query
```

Acts exactly like [Connection.query][] except queries are
guaranteed to be performed within the transaction. If the transaction has been
committed or rolled back further calls to `query` will fail.

### Transaction.commit

```ocaml
(Continuation<void>) => void
```

Issue a `COMMIT` (or `RELEASE ...` in the case of nested transactions) statement
to the database. If a callback is given it will be called with any errors after
the `COMMIT` statement completes. The transaction object itself will be unusable
after calling `commit()`.

### Transaction.rollback

```ocaml
(Continuation<void>) => void
```

The same as [Transaction.commit](#transactioncommit) but issues a `ROLLBACK`.
Again, the transaction will be unusable after calling this method.

### Transaction.begin

`(Continuation<void>) => void`

Starts a nested transaction (by creating a savepoint) within this transaction
and returns a new transaction object. Unlike [Connection.begin][], there is no
option to replace the statement used to begin the transaction, this is because
the statement must use a known savepoint name.

While the child transaction is in progress the parent transaction will queue any
queries it receives until the child transaction either commits or rolls back, at
which point it will process the queue. Be careful: it's quite possible to write
code that deadlocks by waiting for a query in the parent transaction before
committing the child transaction. For example:

    // Do not do this! it won't work!

    var parent = conn.begin();  // starts the transaction
    var child = parent.begin(); // creates a savepoint

    parent.query('SELECT 1', function (err) {
      child.commit();
    });

### Transaction.adapter

Contains the adapter name used for this transaction, e.g. `'sqlite3'`, etc.

### Transaction events

 * `'query', query` - emitted immediately after `.query` is called on a
   connection via `tx.query`. The argument is a [query](#query) object.
 * `'commit:start'`      - Emitted when `.commit()` is called.
 * `'commit:complete'`   - Emitted after the transaction has committed.
 * `'rollback:start'`    - Emitted when `.rollback()` is called.
 * `'rollback:complete'` - Emitted after the transaction has rolled back.
 * `'close'`             - Emitted after `rollback` or `commit` completes.
 * `'error', err`        - Emitted under three conditions:
   1. There was an error acquiring a connection.
   2. Any query performed in this transaction emits an error that would otherwise
      go unhandled.
   3. Any of `query`, `begin`, `commit`, or `rollback` are called after the
      connection has already been committed or rolled back.

   Note that the `'error'` event **may be emitted multiple times!** depending on
   the callback you are registering, you way want to wrap it using [once][once].

### Transaction Example

Here's an example where we stream all of our user ids, check them against an
external abuse-monitoring service, and flag or delete users as necessary, if
for any reason we only get part way through, the entire transaction is rolled
back and nobody is flagged or deleted:

	var tx = pool.begin()

	tx.on('error', finished)

	/*
	Why query with the pool and not the transaction?
	Because it allows the transaction queries to begin executing immediately,
	rather than queueing them all up behind the initial SELECT.
	*/
	pool.query('SELECT id FROM users').on('row', function (user) {
		if (tx.state().match('rollback')) return
		abuseService.checkUser(user.id, function (err, result) {
			if (err) return tx.handleError(err)
			// Errors from these queries will propagate up to the transaction object
			if (result.flag) {
				tx.query('UPDATE users SET abuse_flag = 1 WHERE id = $1', [user.id])
			} else if (result.destroy) {
				tx.query('DELETE FROM users WHERE id = $1', [user.id])
			}
		})
	}).on('error', function (err) {
		tx.handleError(err)
	}).on('end', function () {
		tx.commit(finished)
	})

	function finished (err) {
		if (err) console.error(err)
		else console.log('All done!')
	}

# License

2-clause BSD
