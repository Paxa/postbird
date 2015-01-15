// global.Fiber = require('fibers');

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

global.loadBddBase = function () {
  global.bdd = require('../lib/bdd/bdd');
  var asserts = require('../lib/bdd/bdd_assert');

  global.describe = bdd.describe;

  global.assert = asserts.assert;
  global.assert_true = asserts.assert_true;
  global.assert_match = asserts.assert_match;
  global.assert_contain = asserts.assert_contain;

  process.on("uncaughtException", function(err) {
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