require('./object_extras').extendGlobal();

var renameFunction = function (name, fn) {
    return (new Function("return function (call) { return function " + name +
        " () { return call(this, arguments) }; };")())(Function.apply.bind(fn));
};

var lastObjectId = 0;
var classyRegistry = {};

function assignObjectid(newObject) {
  !function (objId) {
    Object.defineProperty(newObject, 'object_id', {
      get: function() {
        return objId;
      }
    });
  }(lastObjectId += 1);
}

var Classy = {
  mutatorMethod: '_Mutator',

  build: function (name, callback) {
    var newClass = this.buildUpPrototype(name);
    classyRegistry[name] = newClass;
    newClass.classEval = function(callback) {
      callback.call(newClass, newClass.prototype);
    };

    newClass.extend = function (someModule) {
      Classy.extend(newClass.prototype, someModule);
    };

    newClass.allocate = function () {
      newObject = Object.create(newClass.prototype);
      assignObjectid(newObject);
      return newObject;
    };

    Object.defineProperty(newClass, 'superclass', {
      get: function() {
        return Classy.BaseKlass;
      }
    });

    Object.defineProperty(newClass, 'ancestors', {
      get: function() {
        return Object.ancestors(this);
      }
    });

    Object.defineProperty(newClass, 'klass', {
      get: function() {
        return Object.getPrototypeOf(this).constructor; // Classy.BaseKlass;
      }
    });

    Classy.extend(newClass, Classy.BaseKlass.KlassMethods);
    //newClass.extend(Inspector);

    if (callback) {
      if (typeof callback == 'function') {
        callback.call(newClass.prototype, newClass.prototype, Classy);
      }
      if (typeof callback == 'object') {
        newClass.include(callback);
        if (typeof callback[this.mutatorMethod] == 'function') {
          callback[this.mutatorMethod].call(newClass.prototype, newClass.prototype, Classy);
        }
      };
    }

    return newClass;
  },

  // extend object
  extend: function(target, module) {
    for (var prop in module) {
      //console.log('extend', prop, module[prop]);
      if (module.hasOwnProperty(prop) && prop != this.mutatorMethod) {
        target[prop] = module[prop];
      }
    }
    return target;
  },

  // extend class (prototype)
  include: function(target, module){
    
  },

  classEval: function(callback) {
    
  },

  getter: function(target, name, fn) {
    Object.defineProperty(target, name, {
      get: fn
    });
  },

  setter: function(target, name, fn) {
    Object.defineProperty(target, name, {
      set: fn
    });
  },

  aliasMethod: function (klass, new_method, old_method) {
    klass[new_method] = klass[old_method];
  },

  aliasProperty: function(target, new_prop, old_prop) {
    Object.defineProperty(target, new_prop, {
      set: function(value) {
        return target[old_prop] = value;
      },
      get: function() {
        return target[old_prop];
      }
    });
  },

  // copy of node.utils.inherits
  inherits: function(ctor, superCtor) {
    ctor.super_ = superCtor;
    if (typeof superCtor == 'function') {
      ctor.prototype = Object.create(superCtor.prototype);
    } else {
      ctor.prototype = superCtor;
    }
    Object.defineProperty(ctor.prototype, 'constructor', {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    });
  },

  buildUpPrototype: function(name) {
    var newClass = eval("(function " + name + " () { assignObjectid(this); this.initialize.apply(this, arguments); })");
    this.inherits(newClass, this.BaseKlass);
    newClass.isKlass = true;
    return newClass;
  },

  constantize: function (name) {
    return classyRegistry[name];
  },
};

Classy.BaseKlass = require('./classy_baseklass')(Classy);
Classy.Inspector = require('./classy_inspector')(Classy);

Classy.BaseKlass.include(Classy.Inspector);

//require('./classy_ls')(Classy);

Classy['new'] = Classy.build;

module.exports = Classy;
