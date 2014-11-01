var ObjectKit = {};

var isPrototype = function isPrototype (obj) {
  var standartClasses = [
    Object,
    Function,
    Boolean,
    Error,
    EvalError,
    //InternalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError,
    Number,
    Math,
    Date,
    String,
    RegExp,
    Array,
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    ArrayBuffer,
    DataView,
    JSON
  ];

  if (typeof obj == 'function' && obj.prototype) {
    if (standartClasses.indexOf(obj) != -1) return true;
  }

  return typeof obj == 'function' && obj.prototype && Object.keys(obj.prototype).length > 0;
};

ObjectKit.forEach = function Object_forEach (object, callback) {
  for (var key in object) {
    if (object.hasOwnProperty(key)) callback(key, object[key]);
  }
};


ObjectKit.values = function Object_values (object) {
  var values = [];
  ObjectKit.forEach(object, function(key, value) { values.push(value); });
  return values;
};


// standart types + array, null, class, date, regexp
// standarts are: undefined, object, boolean, number, string, function
ObjectKit.realType = function Object_realType (object) {
  if (ObjectKit.isPrototype(object)) return 'class';

  if (typeof object == 'object') {
    if (object instanceof Date)        return 'date';
    if (object instanceof RegExp)      return 'regexp';
    if (Array.isArray(object))         return 'array';
    if (object === null)               return 'null';
  }

  return typeof object;
};

ObjectKit.methods = function Object_methods (object) {
  var methods = ObjectKit.own_methods(object);

  ObjectKit.ancestors(object).forEach(function (klass) {
    ObjectKit.own_methods(klass.prototype).forEach(function(methodName) {
      if (methods.indexOf(methodName) == -1) methods.push(methodName);
    })
  });

  return methods;
};


ObjectKit.own_methods = function Object_own_methods (object) {
  var methods = [];

  if (typeof object == 'object' || typeof object == 'function') {
    Object.getOwnPropertyNames(object).forEach(function (key) {
      if (key == 'constructor') return;
      var prop = Object.getOwnPropertyDescriptor(object, key);
      if (!('value' in prop) || !prop.enumerable) {
        if (typeof prop.value == 'function' && !isPrototype(prop.value)) {
          methods.push(key);
        }
      }
    });
  }

  for (var prop in object) {
    try {
      if (object.hasOwnProperty(prop) && typeof object[prop] == 'function' && !isPrototype(object[prop])) {
        methods.push(prop);
      }
    } catch (error) {
      console.error(error);
    }
  }
  return methods;
};


ObjectKit.own_properties = function Object_own_properties (object) {
  var properties;
  if (typeof object == 'object' && object != null || typeof object == 'function') {
    properties = Object.getOwnPropertyNames(object);
  } else {
    return [];
  }

  var filtered = [];

  properties.forEach(function(key) {
    if (key == 'constructor') {
      filtered.push(key);
      return;
    }
    var prop = Object.getOwnPropertyDescriptor(object, key);
    if (!('value' in prop) || !prop.enumerable) {
      if (typeof prop.value != 'function' || isPrototype(prop.value)) {
        filtered.push(key);
      }
    }
  });

  return filtered;
};


ObjectKit.properties = function Object_properties (object) {
  var properties = ObjectKit.own_properties(object);

  ObjectKit.ancestors(object).forEach(function (klass) {
    ObjectKit.own_properties(klass.prototype).forEach(function(methodName) {
      if (properties.indexOf(methodName) == -1) properties.push(methodName);
    })
  });

  return properties;
};

ObjectKit.dynamicProperties = function(object) {
  var properties;
  if (typeof object == 'object' && object != null || typeof object == 'function') {
    properties = Object.getOwnPropertyNames(object);
  } else {
    return [];
  }

  var filtered = [];
  properties.forEach(function(key) {
    var prop = Object.getOwnPropertyDescriptor(object, key);
    if (!('value' in prop) && ('get' in prop)) {
      filtered.push(key);
    }
  });

  return filtered;
};

ObjectKit.allProperties = function(object) {
  var props = [];

  do {
    Object.getOwnPropertyNames(object).forEach(function (prop) {
      if (props.indexOf(prop) === -1) props.push(prop);
    });
  } while (object = Object.getPrototypeOf(object));

  return props;
};

ObjectKit.instance_variables = function Object_instance_variables (object) {
  var ivars = {};
  for (var i in object) {
    if (typeof object[i] != 'function' || isPrototype(object[i])) ivars[i] = object[i];
  }
  return ivars;
};

ObjectKit.instance_variable_names = function Object_instance_variable_names (object) {
  var keys = [];
  for (var i in object) {
    if (typeof object[i] != 'function' || isPrototype(object[i])) keys.push(i);
  }
  return keys;
};

ObjectKit.ancestors = function Object_ancestors (object) {
  prototypes = [];

  if (typeof object == 'number') {
    object = Number.prototype;
    prototypes.push(Number);
  }

  if (typeof object == 'string') {
    object = String.prototype;
    prototypes.push(String);
  }

  if (typeof object == 'boolean') {
    object = Boolean.prototype;
    prototypes.push(Boolean);
  }

  if (typeof object == 'undefined' || (typeof object == 'object' && object == null)) {
    return [];
  }

  var last = object;
  while (last = Object.getPrototypeOf(last)) {
    prototypes.push(last.constructor);
  }

  return prototypes;
};

ObjectKit.isPrototype = isPrototype;
ObjectKit.isConstructor = ObjectKit.isPrototype;

ObjectKit.extendGlobal = function () {
  ObjectKit.forEach(ObjectKit, function (key, value) {
    if (key != 'extendGlobal') Object[key] = value;
  });
};

module.exports = ObjectKit;
