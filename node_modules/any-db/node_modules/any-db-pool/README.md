# any-db-pool - database agnostic connection pool

[![Build Status](https://secure.travis-ci.org/grncdr/node-any-db.png?branch=master)](http://travis-ci.org/grncdr/node-any-db-pool)

## Synopsis

```javascript
var ConnectionPool = require('any-db-pool')
var mysql = require('mysql')

var adapter = {
  createConnection: function (opts, callback) {
    var conn = mysql.createConnection(opts, callback)
    conn.connect(function (err) {
      if (err) callback(err)
      else callback(null, conn)
    })
    return conn
  },
  createQuery: mysql.createQuery
}

var pool = new ConnectionPool(adapter, {user: 'scott', password: 'tiger'}, {
  min: 5,
  max: 15,
  reset: function (conn, done) { conn.query('ROLLBACK', done) }
})

// Proxies to mysql's connection.query
var q = pool.query('SELECT 1', function (err, res) { })
```

## Description

This module contains a database connection pool that can be used with any
driver, though it is designed to integrate well with [any-db][any-db], a
minimal database abstraction layer. If you are writing a library that needs to
support multiple database backends (e.g. SQLite3 or Postgres or MySQL) then it's
highly encouraged that you use [any-db][any-db] and **not** this
module.

If, on the other hand, you just need a connection pool for your application this
should work for you with very little fuss.

[any-db]: http://npm.im/any-db

## Why wouldn't I just use `generic-pool`?

[generic-pool][gpool] is awesome, but it's *very* generic.  This is a Good Thing
for a library with "generic" in the name, but not so good for the very common
but slightly more specialized case of pooling stateful database connection. This
library uses `generic-pool` and simply augments it with some added niceties:

* Hooks for initializing and/or resetting connection state when connections are
	added to the pool.
* A `query` method that allows queries to be performed without the user needing
	a reference to a connection object (and potentially leaking that reference).

[gpool]: http://npm.im/generic-pool

## Installation

`npm install any-db-pool`

## API

You can find the API documentation for this connection pool included in the rest of
the any-db API docs
[here](https://github.com/grncdr/node-any-db/blob/master/API.md#connectionpool).

## License

MIT
