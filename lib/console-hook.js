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