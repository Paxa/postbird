Object.forEach = function Object_forEach (object, callback) {
  for (var key in object) {
    if (object.hasOwnProperty(key)) callback(key, object[key]);
  }
};

Object.values = function Object_values (object) {
  var values = [];
  Object.forEach(object, function(key, value) { values.push(value); });
  return values;
};
