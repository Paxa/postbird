/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base jClass implementation (does nothing)
  this.jClass = function(){};
  
  // Create a new jClass that inherits from this jClass
  jClass.extend = function(prop) {
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
    function jClass() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
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

/*
if (Function.prototype.bind === undefined) {
  Function.prototype.bind = function(that){
    var self = this,
      args = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null,
      F = function(){};

    var bound = function(){
      var context = that, length = arguments.length;
      if (this instanceof bound){
        F.prototype = self.prototype;
        context = new F;
      }
      var result = (!args && !length) ? self.call(context) : self.apply(context, args && length ? args.concat(Array.slice(arguments)) : args || arguments);
      return context == that ? result : context;
    };
    return bound;
  };
}
*/