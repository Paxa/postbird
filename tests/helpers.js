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