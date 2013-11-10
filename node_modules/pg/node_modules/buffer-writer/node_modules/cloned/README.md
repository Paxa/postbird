# cloned

Clone a local or remote git repository at a specific revision.  Then do an `npm install` in it if it has a `package.json` file.

## api

`var cloned = require('cloned');`

### cloned(revision, callback(err, pathToRepository))

`revision` : _string_ - either a path to a repo such as `'git://github.com/brianc/node-cloned@ea1883'` or just a sha `'ea1883'`.  If just given a sha, it will clone the git repo found in `process.cwd`

`callback` : _function_ - callback when the repository is cloned
  `err`: _object_ - error if there was an error cloning
  `pathToRepository`: _string_ - path to cloned repository


## examples

```js
var cloned = require('cloned');

//clone the current git repository (found at process.cwd) to a specific revision
cloned('ea1883', function(err, dir) {

});

```

```js
var cloned = require('cloned');

//clone a remote repository at a specific revision
cloned('https://github.com/brianc/node-cloned@ea18834', function(err, dir) {

});
```

## license
MIT
