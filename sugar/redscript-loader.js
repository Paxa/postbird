var fs = require('fs');
global.options = {};
var compile = require('redscript/lib/compile');

require.extensions['.rs'] = function (module, filename) {
  var red_code = fs.readFileSync(filename, 'utf-8');
  var  js_code = compile(red_code);

  module._compile(js_code, filename);
};

require.extensions['.red'] = require.extensions['.rs'];

//var content = compile(fs.readFileSync('test.rs', 'utf-8'));

//require('./test.rs');