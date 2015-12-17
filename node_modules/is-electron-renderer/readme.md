is-electron-renderer
====================

Check if code is running in Electron `renderer` process.

Why?
----

Electron code can run in either the `main` process or
the `renderer` process. This is the same as asking if
the code is running in a web page with access to the
DOM or not. Read more here: https://github.com/atom/electron/blob/master/docs/tutorial/quick-start.md

### Use Cases:

- Creating a single module that acts differently whether it's running in `main` or `renderer`.
- Logging utility. One process (`main`) would be responsible for writing to log files, while
renderers would send log data to the `main`. Would allow your code to have one `log` method.
- Testing. Your test code may behave differently if the DOM is available.
- Normalize `console.log` behavior. `console.log` behavior is weird in `renderer`, this can easily be fixed.

### Why Use a One Line Module?

Excellent discussion here: https://github.com/sindresorhus/ama/issues/10. If that doesn't convince you,
then maybe the fact that Electron could change the way that they inherit `global` in `renderer` and
if they do, you would have to change your code whereas if you used this module, you'd just have to update
to the latest version =)


Install
-------

    npm i --save is-electron-renderer


Usage
-----

You'll notice that when using `console.log` in Electron that in the `renderer` process
outputs some weird log level garbage to `stderr` before your actual console message.
You can normalize this behavior:

**console-hook.js**:

```js
// clean up Electron output
function hook () {
  var isRenderer = require('is-electron-renderer')
  var pre = '(' + (isRenderer ? 'RENDERER' : 'MAIN') + ') '
  console.log = function (msg) {
    process.stdout.write(pre + msg + '\n')
  }
}

module.exports = {
  hook: hook
}
```

**index.js**:

```js
require('./console-hook').hook()
console.log('hello')
```

output (main):

    (MAIN) hello

output (renderer):

    (RENDERER) hello


API
---

```js
var isRenderer = require('is-electron-renderer')
console.log(isRenderer)
// => (BOOLEAN)
```

License
-------

MIT

Copyright 2015 [JP Richardson](https://github.com/jprichardson)

