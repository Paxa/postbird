// borrow some ideas from here https://github.com/zvictor/ArgueJS/blob/master/argue.js

/*
// extend native type is not a good idea, sweet.js fails
var argumentClass = null;

!function () { argumentClass = arguments.__proto__; }();
*/

GLOBAL.Arg = {};

var typeOf = function typeOf (variable) {
  if (typeof variable == 'object') {
    // TODO: dom-nodelist, arguments, element, zepto-collection
    // for array
    if (variable.constructor == Array) {
      return 'array';
    }
    // for sustom classes
    else if (variable.constructor.prototype.className) {
      return variable.constructor.prototype.className;
    }
    // named functions
    /*
    else if (variable.constructor.prototype.name) {
      return variable.constructor.prototype.name;
    }
    */
    // otherwise just object
    else {
      return 'object';
    }
  } else {
    return (typeof variable);
  }
};

Arg.toArray = function toArray (args) {
  return Array.prototype.slice.call(args);
};

Arg.forEach = function forEach (args, callback) {
  for (var i = 0; i < args.length;  i++) {
    callback(args[i], i);
  }
};

// arguments, 'number', 'string', 'function'
Arg.assert = function assert (type1, type2, type3) {
  var args = arguments.callee.caller.arguments;
  var types = arguments;

  for (var i = 0; i < types.length; i++) {
    var arg = args[i];
    var vtype = typeOf(arg);

    if (vtype != types[i]) {
      throw "Wrong argument type (" + (i + 1) + ") expected '" + types[i] + "' got '" + vtype + "' -- " + String(arg);
    }
  }

  if (types.length > args.length) {
    throw "Wrong argument count: expected at least " + types.length + ", got " + args.length;
  }
};

/*
!function () {
  Arg.assert('string', 'number', 'function');
}('1', 1, console.log);

/*
require ('./jquery.class');
require ('./../app/models/base');

Model.base.prototype.inspect = function () {
  console.log(this.prototype);
  return this;
};

//console.log(Model.base.name);

var o = new Model.base(123);
console.log(typeOf(o));
*/