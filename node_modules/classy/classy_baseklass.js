module.exports = function (Classy) {
  var BaseKlass = function BaseClass () {};

  !function(proto) {
    proto.is_a = function(klass) {
      return this.klass == klass;
    };

    proto.kind_of = function(klass) {
      return Object.ancestors(this).indexOf(klass) >= 0;
    };

    proto.respond_to = function(methodName) {
      return typeof this[methodName] == 'function';
    };

    proto.tap = function (callback) {
      callback.call(this, this);
      return this;
    };

    proto.initialize = function () {};

    Object.defineProperty(proto, 'instance_variable_names', {
      get: function() {
        return Object.instance_variable_names(this);
      }
    });

    Object.defineProperty(proto, 'instance_variables', {
      get: function() {
        return Object.instance_variables(this);
      }
    });

    Object.defineProperty(proto, 'methods', {
      get: function () {
        return Object.methods(this);
      }
    });

    Object.defineProperty(proto, 'properties', {
      get: function() {
        return Object.allProperties(this);
      }
    });

    Object.defineProperty(proto, 'klass', {
      get: function() {
        return Object.getPrototypeOf(this).constructor;
      }
    });

    Object.defineProperty(proto, 'klassName', {
      get: function() {
        return this.klass.name;
      }
    });
  }(BaseKlass.prototype);

  BaseKlass.KlassMethods = {
    inspect: function() {
      return "<::" + this.name + ">";
    },

    include: function include (module1, module2, module3) {
      for (var i = 0; i < arguments.length; i++) {
        Classy.extend(this.prototype, arguments[i]);
      }
    },

    extend: function extend (module) {
      Classy.extend(this, module);
    },

    classEval: function classEval (callback) {
      callback.call(this.prototype, this.prototype, Classy);
    }
  };

  Object.forEach(BaseKlass.KlassMethods, function (key, value) {
    BaseKlass[key] = value;
  });

  BaseKlass.inspect = function() {
    return "<Classy::" + BaseKlass.name + ">";
  };

  return BaseKlass;
};