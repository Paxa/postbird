# Any-DB - a less-opinionated database abstraction layer.

[![Build Status](https://secure.travis-ci.org/grncdr/node-any-db.png?branch=master)](http://travis-ci.org/grncdr/node-any-db)

**v1.0.0-alpha1 released**

_Any-DB 1.0.*_  significantly restructures the various `any-db-*` modules and
you *will* need to update your package.json

**Applications** should replace an `any-db` dependency with one or more
dependencies on `any-db-<adapter>` where `adapter` can be `mysql`, `postgres`,
or `sqlite3`. With this change, a direct dependency on an database driver
package (such as `mysql`) is no longer *required*, though you can continue to
use one if you like.

All of the adapter libraries have `any-db` as a *peerDependency* which means
that `any-db` will be pulled in transitively as a dependency on the same level
as the adapter.

**Libraries** should move their `any-db` dependency to `peerDependencies`,
even though things will appear to operate correctly without doing so. If your
library depends on a database connection (e.g. for tests) you should also add
a peerDependency on the corresponding `any-db-<adapter>` library.

[query]: https://github.com/grncdr/node-any-db/blob/master/API.md

## Synopsis

(There's also detailed [API][API] documentation available)

    var anyDB = require('any-db')
    var dbURL = 'driver://user:pass@hostname/database'
    
Establish a connection:

    var conn = anyDB.createConnection(dbURL)  // Takes an optional callback
    
Make queries:

    var sql = 'SELECT * FROM my_table'
    conn.query(sql).on('row', function (row) {})  // evented
    conn.query(sql, function (error, result) {})  // or callback
    
Use bound parameters:

    sql += ' WHERE my_column = ?'
    conn.query(sql, [42]).on('row', ...)           // again, evented
    conn.query(sql, [42], function (err, res) {})  // or callback

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

The long-term goal of this project is to serve as the testing ground for finding
a suitable common interface, then (hopefully) convincing driver implementors to
support it natively. In short, any-db hopes to prove it's usefulness well enough
that most of it can be obviated by the drivers themselves.

### Things it does

 * Supports MySQL, Postgres, and SQLite3 as equally as possible. (More driver
	 support is very much welcomed!)
 * Parses connection parameters from URLs: `driver://user:pass@host/database`
 * Streams results or gets them all at once, using an [api][query] almost
	 identical to the existing interfaces of the MySQL and Postgres drivers.
 * A simple, solid, [connection pool][pool] with the ability to execute queries
	 directly on a pool for auto-release behaviour. E.g. - this will never leak
	 connections: `pool.query("SELECT 1", function (err, results) { ... })`
 * Stateful [transaction objects][tx] for managing database transactions.

### Things it might do (feedback needed!)

 * Provide a common result set API.

### Things it will never do

 * Add it's own query helper methods like `.first` or `.fetchAll`
 * Include any sort of SQL string building. You might want to try my other library
	 [gesundheit](https://github.com/BetSmartMedia/gesundheit), or one of the many
	 [alternatives](https://encrypted.google.com/search?q=sql&q=site:npmjs.org&hl=en)
	 for that. _(send me pull requests to list your libs here)_

## Install

    npm install --save any-db-{pg,mysql,sqlite3}

## Contributing

For ideas that would change an existing API or behaviour please open an issue to
propose the change before spending time on implementing it. I know it's hard (I
code-first-ask-questions-later *way* too frequently :smile:) but I'd really hate
for anybody to put their time into something that won't be merged.

I'm not terribly picky about code-formatting, but please try and keep lines
under 80 characters long if you can help it.


## License

MIT

[API]: https://github.com/grncdr/node-any-db/blob/master/API.md
[query]: https://github.com/grncdr/node-any-db/blob/master/API.md#query
[pool]: https://github.com/grncdr/node-any-db/blob/master/API.md#exportscreatepool
[tx]: https://github.com/grncdr/node-any-db/blob/master/API.md#transaction
