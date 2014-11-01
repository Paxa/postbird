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

    if (typeof methodName == 'string') {
      _this[methodName].apply(_this, args);
    } else if (typeof methodName == 'function') {
      methodName.apply(_this, args);
    }

    Fiber.yield();
    return newValue;
  };
};


global.syncMutator = function (object, method) {
  var fn = object[method];
  object['_origin_async_' + method] = fn;
  var wrapped = object.wrapSync(fn);

  object[method] = function () {
    if (Fiber.current) {
      return wrapped.apply(object, arguments);
    } else {
      return fn.apply(object, arguments);
    }
  };
};
