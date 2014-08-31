# parse-db-url

## API

```ocaml
module.exports := (String) => {
    adapter:  String,
    host:     String?,
    port:     String?,
    database: String?,
    user:     String?,
    password: String?
}
```

Turn a string database URL into an object. This differs from a plain
`require('url').parse(...)` in that it understands some conventions around
different database drivers and query-string parameters can override those found
earlier in the URL. (e.g. `user=foo` in the query string overrides a `bar@host`
in the URL.

# License

2-clause BSD
