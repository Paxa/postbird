/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {
  var newCall = function (Cls, args) {
    var constructorArgs = [Cls].concat(Array.prototype.slice.call(args));
    // Cls.bind(Cls, args[0], args[1], args[2], ..) # Cls.bind(Cls, *args)
    // Cls.bind.apply(Cls, [Cls] + args);
    return new (Function.prototype.bind.apply(Cls, constructorArgs));
  };

  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base jClass implementation (does nothing)
  this.jClass = function jClass () { };
  
  // Create a new jClass that inherits from this jClass
  jClass.extend = function extend (prop) {
    var _super = this.prototype;
    
    // Instantiate a base jClass (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-jClass
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy jClass constructor
    // if propery className exist then give it to function.name, for easier debug
    var fnName = prototype.className ? prototype.className.replace(/[^\d\w\_]/g, '_') : '';
    var jClass = eval("(function " + fnName + "() { " +
      // when we do direct call of class. eg.\
      // (new MyClass('name')).doSomethimg => MyClass('name').doSomethimg\
      "if (!(this instanceof jClass)) { " +
        "return newCall(jClass, arguments); " +
      "}\n" +

      // All construction is actually done in the init method\
      "if ( !initializing && this.init ) " +
        "this.init.apply(this, arguments); " +
    "})");

    if (typeof prototype.klassExtend == 'object') {
      for (var key in prototype.klassExtend) {
        if (prototype.klassExtend.hasOwnProperty(key)) {
          jClass[key] = prototype.klassExtend[key];
        }
      }
    }

    // Populate our constructed prototype object
    jClass.prototype = prototype;

    // Enforce the constructor to be what we expect
    jClass.prototype.constructor = jClass;

    // And make this jClass extendable
    jClass.extend = arguments.callee;
    
    return jClass;
  };
})();

// Widget constructor
function Widget(props) {
  props.init = (function (origin) {
    return function(element) {
      this.element = $u(element);
      origin.apply(this, arguments);
    };
  })(props.init);

  if (typeof props.selector == "object") {
    var s = "";
    for (var k in props.selector) s += '[' + k + '="' + props.selector[k] + '"]';
    props.selector = s;
  }

  if (!props.find) {
    props.find = function find (selector) {
      return this.element.find(selector);
    };
  }

  if (!props.bindEvent) {
    props.bindEvent = function bindEvent (selector, event, handler) {
      this.find(selector).bind(event, handler.bind(this));
    }
  }

  if (!props.Class) props.Class = {};
  props.Class.init = function (node) {
    if (this.prototype.selector) {
      var selector = this.prototype.selector;
      var klass = this;
      if (node) {
        $u(node).find(selector).each(function(i, el) {
          new klass(el);
        });
      }
    }
    return klass;
  };

  var klass = jClass.extend(props);

  return klass;
}

global.Widget = Widget;