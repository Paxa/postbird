# pgpass

[![Build Status](https://travis-ci.org/hoegaarden/pgpass.png?branch=master)](https://travis-ci.org/hoegaarden/pgpass)

## Install

```sh
npm install pgpass
```

## Usage
```js
var pgPass = require('pgpass');

var connInfo = {
  'host' : 'pgserver' ,
  'user' : 'the_user_name' ,
};

pgPass(connInfo, function(pass){
  conn_info.password = pass;
  // connect to postgresql server
});
```

## Description

This module tries to read the `~/.pgpass` file (or the equivalent for windows systems). If the environment variable `PGPASSFILE` is set, this file is used instead. If everything goes right, the password from said file is passed to the callback; if the password cannot be read `undefined` is passed to the callback.

Cases where `undefined` is returned:

- the environment variable `PGPASSWORD` is set
- the file cannot be read (wrong permissions, no such file, ...)
- for non windows systems: the file is write-/readable by the group or by other users
- there is no matching line for the given connection info

There should be no need to use this module directly; it is already included in `node-postgresq`.

## Configuration

The module reads the environment variable `PGPASS_NO_DEESCAPE` to decide if the the read tokens from the password file should be de-escaped or not. Default is to do de-escaping. For further information on this see [this commit](https://github.com/postgres/postgres/commit/8d15e3ec4fcb735875a8a70a09ec0c62153c3329).


## Tests

There are tests in `./test/`; including linting and coverage testing. Running `npm test` runs:

- `jshint`
- `mocha` tests
- `jscoverage` and `mocha -R html-cov`

You can see the coverage report in `coverage.html`.


## Development, Patches, Bugs, ...

If you find Bugs or have improvments, please feel free to open a issue on github. If you provide a pull request, I'm more than happy to merge them, just make sure to add tests for your changes.

## Links

- https://github.com/hoegaarden/node-pgpass
- http://www.postgresql.org/docs/current/static/libpq-pgpass.html
- https://wiki.postgresql.org/wiki/Pgpass
- https://github.com/postgres/postgres/blob/master/src/interfaces/libpq/fe-connect.c
