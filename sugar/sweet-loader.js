sweet = require('sweet.js');

sweet.loadMacro(__dirname + '/macros/str');
sweet.loadMacro(__dirname + '/macros/puts');
sweet.loadMacro(__dirname + '/macros/unless');
//sweet.loadMacro('./sugar/macros/in');
//sweet.loadMacro('./sugar/macros/prototype'); // -> this two don't work with my hack
sweet.loadMacro(__dirname + '/macros/nullity');
sweet.loadMacro(__dirname + '/macros/lambda');

//require('./test.sjs');
