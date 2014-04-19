sweet = require('sweet.js');

sweet.loadMacro('./sugar/macros/str');
sweet.loadMacro('./sugar/macros/puts');
sweet.loadMacro('./sugar/macros/unless');
//sweet.loadMacro('./sugar/macros/in');
//sweet.loadMacro('./sugar/macros/prototype'); // -> this two don't work with my hack
sweet.loadMacro('./sugar/macros/nullity');
sweet.loadMacro('./sugar/macros/lambda');

//require('./test.sjs');
