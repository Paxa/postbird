var util = require('util');

var asserts = {};

var stringify = function (obj) {
  return util.inspect(obj, {depth: 5});

  return JSON.stringify(obj);
};

var isSameArrays = function (arrayA, arrayB) {
  if (arrayA.length != arrayB.length) return false;

  for (i = 0; i < arrayA.length; i++) {
    if (arrayB.indexOf(arrayA[i]) == -1) {
      return false;
    }
  }

  for (i = 0; i < arrayB.length; i++) {
    if (arrayA.indexOf(arrayB[i]) == -1) {
      return false;
    }
  }

  return true;
};

var isSame = function (var1, var2) {
  if (Array.isArray(var1) && Array.isArray(var2)) {
    return isSameArrays(var1, var2);
  }

  if (typeof var1 == 'object' && typeof var2 == 'object') {
    var v1 = util.inspect(var1, undefined, 10);
    var v2 = util.inspect(var2, undefined, 10);
    return v1 == v2;

    //return Object.is(var1, var2);
  } else {
    return var1 == var2;
  }
};



asserts.assert = function assert (var1, var2) {
  /*
  if (typeof var1 == 'object') var1 = stringify(var1);
  if (typeof var2 == 'object') var2 = stringify(var2);
  */

  if (!isSame(var1, var2)) {
    if (typeof var1 == 'object') var1 = stringify(var1);
    if (typeof var2 == 'object') var2 = stringify(var2);

    var error = new Error("'assert' failed:\n" + String(var1) + " is not\n" + String(var2));
    bdd.onError(error);
    throw bdd.stopTest;
  }
};

asserts.assert_true = function assert_true (value) {
  if (!value) {
    //var stack = new Error().stack;
    //console.log(stack.join("\n"));
    bdd.onError(new Error("'assert_true' failed: expected true, got " + String(value)));
    //throw "'assert_true' failed: expected true, got " + String(value);
    throw bdd.stopTest;
  }
};

asserts.assert_false = function assert_false (value) {
  if (value) {
    bdd.onError(new Error("'assert_true' failed: expected false, got " + String(value)));
    throw bdd.stopTest;
  }
};

asserts.assert_match = function assert_match (string, regexp) {
  if (!string.match(regexp)) {
    bdd.onError(new Error("'assert_match' failed: expected '" + String(string) + "' to match " + regexp));
    throw bdd.stopTest;
  };
};

asserts.assert_contain = function assert_contain (array, element) {
  if (array.indexOf(element) == -1) {
    bdd.onError(new Error("'assert_contain' failed: expected '" + JSON.stringify(array) + "' to contain " + JSON.stringify(element)));
    throw bdd.stopTest;
  };
};

module.exports = asserts;