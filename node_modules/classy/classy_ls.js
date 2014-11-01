// look see
module.exports = function (Classy) {
  var colors = require('colors');

  var puts = function (str, color) {
    if (color !== undefined) {
      process.stdout.write(String(str)[color] + "\n");
    } else {
      process.stdout.write(String(str) + "\n");
    }
  };

  function printDebug (object) {
    // CLASS VARIABLES
    puts("    variables:");
    for (var key in object) {
      if (typeof object[key] != 'function') {
        puts("      " + key, 'green');
      }
    }

    // CLASS METHODS (static)
    puts("    methods:");
    for (var key in object) {
      if (typeof object[key] == 'function') {
        puts("      " + key, 'green');
      }
    }

    // CLASS PROPERTIES
    puts("    properties:");
    if (object.isKlass) {
      var properties = Object.getOwnPropertyNames(object);
      if (object.isKlass) {
        properties = properties.concat(Object.getOwnPropertyNames(object.superclass));
      }
      properties.forEach(function(key) {
        var prop = Object.getOwnPropertyDescriptor(object, key) || Object.getOwnPropertyDescriptor(object.klass.prototype, key);
        if (prop && !('value' in prop)) {
          puts("      " + key, 'green');
        }
      });
    } else {
      object.properties.forEach(function(key) {
        puts("      " + key, 'green');
      });
    }
  }

  Classy.ls = function (object) {
    if (object.isKlass) {
      puts(JSON.stringify(object.name) + " is a class.", 'bold');
      puts("  # class");
      printDebug(object);

      puts("  # instance");
      printDebug(object.prototype);

    } else if (object.isPrototype()) {
    
    } else if (object.isInstance()) {
    
    }
  };
};