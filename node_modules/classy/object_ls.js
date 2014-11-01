var ObjectKit = require('./object_extras');

var colors = require('colors');

var puts = function (str, color) {
  if (color !== undefined) {
    process.stdout.write(String(str)[color] + "\n");
  } else {
    process.stdout.write(String(str) + "\n");
  }
};

var jsonCensor = function censor(censor) {
  var i = 0;

  return function (key, value) {
    if (i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) {
      return '[Circular]';
    }

    if (i >= 29) {// seems to be a harded maximum of 30 serialized objects?
      return '[Unknown]';
    }

    ++i; // so we know we aren't using the original object anymore

    return value;
  }
};

var skipableClasses = ['ReadStream', 'WriteStream'];

var debugValue = function debugValue (object) {
  var type = ObjectKit.realType(object);

  switch (type) {
    case 'null':      return "null";
    case 'class':     return object.inspect ? object.inspect() : object.name;
    case 'date':      return object.toString();
    case 'regexp':    return object.toString();
    case 'undefined': return "undefined";
    case 'boolean':   return object.toString();
    case 'number':    return object.toString();
    case 'string':    return object.toString();
    case 'function':  return "function '" + object.name + "'";
    case 'array':
      return JSON.stringify(object, jsonCensor);
      break;
    case 'object':
      if (skipableClasses.indexOf(object.constructor.name) != -1) return "**WriteStream**";
      if (typeof object.inspect == 'function') return object.inspect();
      var values = [];
      ObjectKit.forEach(object, function(obj_k, obj_v) {
        values.push( obj_k.toString() + ": " + debugValue(obj_v) );
      });
      return '{' + values.join(', ') + '}';
      break;
    default:          return object.toString();
  }

  return object.toString();
};

Object.ls = function Object_ls (object, dump_vars) {
  if (dump_vars === undefined) dump_vars = true;
  if (skipableClasses.indexOf(object.constructor.name) != -1) {
    puts("* variable values will not be shown");
    dump_vars = false;
  }

  puts('-> instance of ' + String(object.constructor.name).bold);

  puts("  variables:");
  ObjectKit.instance_variable_names(object).forEach(function(key) {
    if (dump_vars) {
      var value = debugValue(object[key]);
      puts("  * " + key + " = " + value, 'green');
    } else {
      puts("  * " + key, 'green');
    }
  });

  puts("  properties:");
  ObjectKit.own_properties(object).forEach(function(key) {
    var prop = Object.getOwnPropertyDescriptor(object, key);
    puts("  @ " + key, 'cyan');
  });

  puts("  own methods:");
  ObjectKit.own_methods(object).forEach(function(key) {
    puts("  * " + key, 'green');
  });

  puts("  inherited:");

  if (typeof object == 'object') {
    var proto = Object.getPrototypeOf(object);
  } else {
    var proto = object.constructor && object.constructor.prototype;
  }

  while (proto) {
    puts('  -> from ' + String(proto.constructor ? proto.constructor.name : proto.name).bold);
    ObjectKit.own_methods(proto).forEach(function(key) {
      puts("    * " + key, 'green');
    });
    ObjectKit.own_properties(proto).forEach(function(key) {
      puts("    @ " + key, 'cyan');
    });
    proto = Object.getPrototypeOf(proto);
  }
};

//var inherits = require('util').inherits;

var inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  if (typeof superCtor == 'function') {
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  } else {
    ctor.prototype = superCtor;
    Object.defineProperty(ctor.prototype, 'constructor', {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
};

/*
var domain = require('domain');

var Product = function Product () {
  
}

inherits(Product, new domain.Domain);

Product.prototype.code = "SKU-1";
Product.prototype.label = "Mouse";
Product.prototype.register = function () { };
Product.prototype.reduce = function () { };
Product.prototype.increase = function () { };

var p = new Product;
p.imUniq = function () { };

var SubProduct = function SubProduct () {
  
};

inherits(SubProduct, p);

SubProduct.prototype.isSubProduct = function () { };

Object.ls(new SubProduct);
*/

//Object.ls(console);
//Object.ls(new Date);