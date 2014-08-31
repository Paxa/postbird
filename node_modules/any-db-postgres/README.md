# any-db-postgres

[![Build Status](https://secure.travis-ci.org/grncdr/node-any-db-postgres.png)](http://travis-ci.org/grncdr/node-any-db-postgres)

This is the postgres adapter for Any-DB. It relies on the [pg][] database
driver to create [Connection][] and [Query][] objects that conform to the
[Any-DB API][]. The API is practically identical to that of `require('pg')` but
allows your app code to be portable between databases.

## API extensions

The connections and queries this package creates here are monkey-patched
versions of the ones created by `require('pg')`, so any methods that `pg`
supports beyond those specified by Any-DB are also available to you. Keep
in mind that these methods will *not* necessarily work with other backends.

### Pure Javascript driver

If you have issues using the native backend for the pg driver on your platform,
you can force anyDB to use the pure-JavaScript driver like so:

```javascript
require('any-db-postgres').forceJS = true
```

You **must** do the above *before* you create any connections or connection
pools.

## Install

    npm install any-db-postgres

## License

MIT

[pg]: http://github.com/brianc/node-postgres
[Connection]: https://github.com/grncdr/node-any-db-adapter-spec#connection
[Query]: https://github.com/grncdr/node-any-db-adapter-spec#query
[Any-DB API]: https://github.com/grncdr/node-any-db-adapter-spec
