module.exports = {
  forEach: function (object, callback) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) callback(key, object[key]);
    }
  }
};

Object.forEach = module.exports.forEach;
(global as any).ObjectKit = module.exports;