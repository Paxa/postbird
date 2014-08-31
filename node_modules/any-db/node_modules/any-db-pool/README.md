# any-db-pool - database agnostic connection pool

[![Build Status](https://secure.travis-ci.org/grncdr/node-any-db.png?branch=master)](http://travis-ci.org/grncdr/node-any-db-pool)

## Synopsis

```javascript
var ConnectionPool = require('any-db-pool')
var adapter = require('any-db-mysql')

var pool = new ConnectionPool(
  adapter,
  { user: 'scott', password: 'tiger' },
  { min: 5,
    max: 15,
    reset: function (conn, done) {
      conn.query('ROLLBACK', done)
    }
  })

// Proxies to mysql's connection.query
var q = pool.query('SELECT 1', function (err, res) { })
```

## Description

This module contains a database connection pool that can be used with any
driver, though it is designed to work well with [any-db compliant
adapters][any-db-adapter-spec]. If you are writing a library that needs to support multiple database
backends (e.g. SQLite3 or Postgres or MySQL) then it's highly encouraged that
you add [any-db][any-db] to your `peerDependencies` and **not** this module
directly.

[any-db-adapter-spec]: https://github.com/grncdr/node-any-db-adapter-spec

## Why wouldn't I just use `generic-pool`?

[generic-pool][gpool] is awesome, but it's *very* generic.  This is a Good
Thing for a library with "generic" in the name, but not so good for the very
common but slightly more specialized case of pooling stateful SQL database
connections.  This library uses `generic-pool` and simply augments it with some
added niceties:

* Hooks for initializing and/or resetting connection state when connections are added or returned to the pool.
* A `query` method that allows queries to be performed without the user needing a reference to a connection object (and potentially leaking that reference).

## API

*Note:* ConnectionPool instances are usually created with the [createPool][] function from [any-db], which automatically selects an [Adapter][] for a given database URL.

```ocaml
module.exports := (Adapter, adapterConfig: Object, PoolConfig) => ConnectionPool

ConnectionPool := EventEmitter & {
  adapter: String,
  query:   (String, Array?, Continuation<ResultSet>?) => Query,
  begin:   (Continuation<Transaction>?) => Transaction,
  acquire: (Continuation<Connection>) => void,
  release: (Connection) => void,
  close:   (Continuation<void>?) => void,
}

PoolConfig := {
  min: Number?,
  max: Number?,
  onConnect: (Connection, ready: Continuation<Connection>) => void
  reset: (Connection, done: Continuation<void>) => void
}
```

### PoolConfig

A `PoolConfig` is generally a plain object with any of the following properties (they are all optional):

 - `min` (default `0`) The minimum number of connections to keep open in the pool.
 - `max` (default `10`) The maximum number of connections to keep open in the pool. When this limit is reached further requests for connections will queue waiting for an existing connection to be released back into the pool.
 - `onConnect` Called immediately after a connection is first established. Use this to do one-time setup of new connections. The supplied `Connection` will not be added to the pool until you pass it to the `done` continuation.
 - `reset` Called each time a connection is returned to the pool. Use this to restore a connection to it's original state (e.g. rollback transactions, set the database session vars). If `reset` fails to call the `done` continuation the connection will be lost in limbo.

### ConnectionPool.query

```ocaml
(String, Array?, Continuation<ResultSet>?) => Query
```

Acts exactly like [Connection.query][] by automatically acquiring a connection
and releasing it when the query completes.

### ConnectionPool.begin

```ocaml
(Continuation<Transaction>?) => Transaction
```

Acts exactly like [Connection.begin][], but the underlying
connection is returned to the pool when the transaction commits or rolls back.

### ConnectionPool.acquire

```ocaml
(Continuation<Connection>) => void
```

Remove a connection from the pool. If you use this method you **must** return
the connection back to the pool using [ConnectionPool.release][]

### ConnectionPool.release

```ocaml
(Connection) => void
```

Return a connection to the pool. This should only be called with connections
you've manually [acquired](#connectionpoolacquire). You **must not** continue
to use the connection after releasing it.

### ConnectionPool.close

```ocaml
(Continuation<void>?) => void
```

Stop giving out new connections, and close all existing database connections as
they are returned to the pool.

### ConnectionPool.adapter

The string name of the adapter used for this connection pool, e.g. `'sqlite3'`.

### ConnectionPool events

 * `'acquire'` - emitted whenever `pool.acquire` is called
 * `'release'` - emitted whenever `pool.release` is called
 * `'query', query` - emitted immediately after `.query` is called on a
   connection via `pool.query`. The argument is a [Query][] object.
 * `'close'` - emitted when the connection pool has closed all of it
   connections after a call to `close()`.

## Installation

`npm install any-db-pool`

## License

MIT

[gpool]: http://npm.im/generic-pool
[any-db]: https://github.com/grncdr/node-any-db
[Adapter]: https://github.com/grncdr/node-any-db-adapter-spec#adapter
[createPool]: https://github.com/grncdr/node-any-db#exportscreatepool
[Connection.query]: https://github.com/grncdr/node-any-db-adapter-spec#connectionquery
[Query]: https://github.com/grncdr/node-any-db-adapter-spec#query
