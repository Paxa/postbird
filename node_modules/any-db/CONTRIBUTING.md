# Contributing to Any-DB development

Want to help improve Any-DB? You're in the *wrong* place :wink:. The individual
parts of the "Any-DB ecosystem" all live in their own repos, so the right place
to be depends on what you want to do:

## I want to write a new adapter

Awesome! You'll probably want to review [the spec][], and maybe some of the
existing adapters. When it's time to write some code, you can add the spec to
your devDependencies and use it to test your adapter for compliance:

    npm install --save-dev any-db-adapter-spec
    node_modules/.bin/test-any-db-adapter --url "my-adapter://user@host/database"

## I want to improve an existing adapter

Cool, then you will probably want one of these repos:

 * [any-db-mysql](https://github.som/grncdr/node-any-db-mysql)
 * [any-db-postgres](https://github.som/grncdr/node-any-db-postgres)
 * [any-db-sqlite3](https://github.som/grncdr/node-any-db-sqlite3)

## I want to improve the connection pool

It lives over here: [any-db-pool][]

## I want to improve the transaction object

It's over in this repo: [any-db-transaction][]. Testing it is a bit weird
because it's mostly tested transitively via the adapters that depend on it.
This is something I'd like to improve but for now you should clone one of the
adapter repos and `npm link` your dev copy of the transaction in place, then
run the tests for the adapter to check your changes.

## Creating a pull-request

For changes to an existing API please open an issue to discuss the proposed
change before implementing it. Code-first-ask-questions-later *is* fun, but I'd
really hate for anybody to put their time into something that won't be merged.

## Code style

I'm not terribly picky about code-formatting, but please try to match the style
of the code around your change. In particular, use two-space tabs, and keep
lines under 80 characters long if you can help it.

If a patch you're working on is getting hairy, don't be afraid to refactor
existing code.

[any-db-pool]: https://github.com/grncdr/node-any-db-pool
[any-db-transaction]: https://github.com/grncdr/node-any-db-transaction
