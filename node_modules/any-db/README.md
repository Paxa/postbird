# Any-DB - a less-opinionated database abstraction layer.

[![Build Status](https://secure.travis-ci.org/grncdr/node-any-db.png?branch=master)](http://travis-ci.org/grncdr/node-any-db)

_The less-opinionated Node.js database abstraction layer_

## Synopsis

```ocaml
module.exports := {
  createConnection: (Url, Continuation<Connection>?) => Connection
  createPool: (Url, PoolConfig) => ConnectionPool
}

Url := String | { adapter: String }

PoolConfig := {
  min: Number,
  max: Number,
  onConnect: (Connection, ((Error) => void) => void
  reset: (Connection, ((Error) => void) => void
}
```

Establish a connection:

```javascript
// Takes an optional callback
var conn = anyDB.createConnection('driver://user:pass@hostname/database')
```

Make queries:

```javascript
var sql = 'SELECT * FROM my_table'
conn.query(sql).on('row', function (row) {})  // evented
conn.query(sql, function (error, result) {})  // or callback

Use bound parameters:

sql += ' WHERE my_column = ?'
conn.query(sql, [42]).on('row', ...)           // again, evented
conn.query(sql, [42], function (err, res) {})  // or callback
```

Close a connection:

    conn.end()
    
Start a transaction:

    var tx = conn.begin()             // Can also take a callback
    tx.on('error', function (err) {}) // Emitted for unhandled query errors
    tx.query(...)                     // same interface as connections, plus...
    tx.commit()                       // takes an optional callback for errors
    tx.rollback()                     // this too
    
Create a connection pool that maintains 2-20 connections

    var pool = anyDB.createPool(dbURL, {min: 2, max: 20})
    
    pool.query(...)       // perform a single query, same API as connection
    var tx = pool.begin() // start a transaction, again, same API as connection
    pool.close()          // close the pool (call when your app should exit)

## Description

The purpose of this library is to provide a consistent API for the commonly used
functionality of SQL database drivers, while avoiding altering driver behaviour
as much as possible.

## Installation

### For Applications

   npm install --save any-db-{postgres,mysql,sqlite3}

All of the adapter libraries have `any-db` as a *peerDependency*, which means
that `require('any-db')` will work even though you don't install it directly or
add it to your package.json.

### For Libraries

Add `any-db` to `peerDependencies` in package.json. This allows users of your
library to satisfy the any-db dependency by installing the adapter of their
choice.

## API

The API of [Connection][] and [Query][] objects is fully described in the
[adapter-spec][], while [Transaction][] and [ConnectionPool][] objects have
their own documentation. Connections, transactions and pools all have a `query`
method that behaves consistently between drivers.

Both exported functions require an `Url` as their first parameter. This can
either be a string of the form `adapter://user:password@host/database` (which
will be parsed by [parse-db-url][]) or an object. When an object is used, it
**must** have an `adapter` property, and any other properties required by the
specified adapters [createConnection][] method.

See also: README notes for your chosen adapter
([MySQL](https://github.com/grncdr/node-any-db-mysql),
 [Postgres](https://github.com/grncdr/node-any-db-postgres), and
 [SQLite3](https://github.com/grncdr/node-any-db-sqlite3))

## License

MIT

[createConnection]: https://github.com/grncdr/node-any-db-adapter-spec#adapter-createconnection
[ConnectionPool]: https://github.com/grncdr/node-any-db-pool#api
