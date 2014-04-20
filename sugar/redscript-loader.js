var fs = require('fs');

global.options = {
    watchFiles: false,
    moduleType: 'commonjs',
    aliases: true,
    insertSemiColons: true,
    classInsertion: true
};

global.state = {};

process.on('state:reset', function() {
    global.state = {
        debug: false,
        declaredVars: [],
        ittIndex: 0,
        hasClass: false
    };
});

// init the state object
process.emit('state:reset')


// update each key's value in state
process.on('state:update', function(obj) {
    for (var key in obj) {
      state[key] = obj[key];
    }
});


// Increment a key's value by one
// @type {string} key
process.on('ittIndex:inc', function(key) {
    //console.log('before inc:', state.ittIndex);
    state.ittIndex += 1;
    // send an updated count
    process.emit('state:send', state.ittIndex);
    //console.log(state);
});

var compile = require('redscript/lib/compile');

require.extensions['.rs'] = function (module, filename) {
  var red_code = fs.readFileSync(filename, 'utf-8');
  var  js_code = compile(red_code);

  //process.stdout.write(js_code);

  module._compile(js_code, filename);
};

require.extensions['.red'] = require.extensions['.rs'];

//var content = compile(fs.readFileSync('test.rs', 'utf-8'));

//require('./test.rs');