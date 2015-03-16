global.Fiber = require('fibers');

global.waiting = function(runner) {
  var newValue;
  var fiber = Fiber.current;
  runner(function(data) {
    newValue = data;
    fiber.run();
  });
  Fiber.yield();
  return newValue;
}

Object.prototype.runSync = function() {
  var newValue;
  var fiber = Fiber.current;

  var args = Array.prototype.slice.call(arguments);
  var methodName = args.shift();

  args.push(function(data) {
    newValue = data;
    fiber.run();
  });

  this[methodName].apply(this, args);
  Fiber.yield();
  return newValue;
};

Object.prototype.runSyncCb = function() {
  var newValue;
  var fiber = Fiber.current;

  var args = Array.prototype.slice.call(arguments);
  var methodName = args.shift();
  var userCallback = args.pop();

  args.push(function(data) {
    var result = userCallback.apply(this, arguments);
    newValue = result;
    fiber.run();
  });

  this[methodName].apply(this, args);
  Fiber.yield();
  return newValue;
};

Object.prototype.wrapSync = function(methodName) {
  var _this = this;

  return function () {
    var fiber = Fiber.current;
    var newValue;
    var args = Array.prototype.slice.call(arguments);
    args.push(function(data) {
      newValue = data;
      fiber.run();
    });

    _this[methodName].apply(_this, args);
    Fiber.yield();
    return newValue;
  };
};

Object.prototype.makeSync = function () {
  for (var n = 0; n < arguments.length; n++) {
    this.makeSyncFn(arguments[n]);
  }
};

Object.prototype.makeSyncFn = function(methodName, errorArgNum) {
  var origFn = this[methodName];
  var _this = this;

  if (origFn == undefined) {
    throw "Object don't have property '" + methodName + "'";
  }

  this[methodName] = function () {
    var lastArg = arguments[arguments.length - 1];

    if (!Fiber.current && typeof lastArg != 'function') {
      throw "please run '" + methodName + "' in fiber or pass a callback as last argument";
    }

    if (Fiber.current && typeof lastArg != 'function') {
      //puts("Run sync " + methodName);
      //puts(arguments);
      var fiber = Fiber.current;
      var newValue;
      var args = Array.prototype.slice.call(arguments);
      errorArgNum = errorArgNum || 2;
      args.push(function(data) {
        var error = arguments[errorArgNum - 1];
        if (error) {
          throw error;
        }
        newValue = data;
        fiber.run();
      });
      origFn.apply(this, args);
      Fiber.yield();
      return newValue;
    } else {
      origFn.apply(this, arguments);
    }
  };
};

global.sync_it = function (message, callback) {
  bdd.it(message, function (done) {
    Fiber(function () {
      callback();
      done();
    }).run();
  });
}

global.loadBddBase = function () {
  global.bdd = require('../lib/bdd/bdd');
  var asserts = require('../lib/bdd/bdd_assert');

  global.describe = bdd.describe;

  global.assert = asserts.assert;
  global.assert_true    = asserts.assert_true;
  global.assert_false   = asserts.assert_false;
  global.assert_match   = asserts.assert_match;
  global.assert_contain = asserts.assert_contain;
  global.assert_present = asserts.assert_present;

  process.on("uncaughtException", function(err) {
    /*
    if (err == null) {
      var err1 = new Error();
      //newErr.stack;
      //puts(newErr.stack)
    }
    */

    bdd.onError(err);
  });
};

global.loadTestCases = function (path) {
  var testFiles = node.fs.readdirSync(node.path.resolve(__dirname, path));

  var args;
  if (global.GUI) {
    args = global.GUI.App.argv;
  } else {
    args = process.argv.slice(2);
  }

  if (args.length > 0) {
    var pattern = args[0];
    testFiles = testFiles.filter(function(file) {
      return file.indexOf(pattern) != -1;
    });
  }

  testFiles.forEach(function (file) {
    require(node.path.resolve(__dirname, path, file));
  });
};

// checkDbError("Drop procedure", error);

global.checkDbError = function (operation, error) {
  if (error) {
    //console.log(error);
    var msg = operation + " error: " + error + "\n";
    bdd.reporter.puts(msg, "red");
    bdd.reporter.puts(error.query + "\n");
    if (error.detail) bdd.reporter.puts(error.detail + "\n");
    if (error.hint) bdd.reporter.puts("HINST: " + error.hint + "\n");
    process.exit(1);
  }
};

global.DbCleaner = jClass.extend({
  init: function(connection){
    this.connection = connection;
  },

  recreateSchema: function (callback) {
    var sql = "drop schema public cascade; create schema public;";
    this.connection.query(sql, function (result, error) {
      checkDbError("Recreate schema", error);
      callback();
    })
  },

  fibRecreateSchema: function () {
    var fiber = Fiber.current;
    this.recreateSchema(function () {
      fiber.run();
    })
    Fiber.yield();
  }
})
