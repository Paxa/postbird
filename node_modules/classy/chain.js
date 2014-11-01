var CanYo = {
  name: 'CanYo',
  yo: function() {
    console.log("Yooooo!");
  }
};

var CanMiu = {
  name: 'CanMiu',
  miu: function() {
    console.log("Miouu!");
  }
};

var myClass = function myClass () {};


function clone(obj) {
  var copy = {};
  for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

function cloneToFunction(obj) {
  var copy = new Function();
  for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

var isEmptyObj = function isEmptyObj (a) {
  return (a.constructor == {}.constructor && Object.keys(a).length == 0);
};

var prependPrototype = function (reciever, extender) {
  var samplePrototype = clone(extender);
  if (!isEmptyObj(reciever.prototype)) {
    samplePrototype.prototype = reciever.prototype;
  }
  reciever.prototype = samplePrototype;
};

var printAncesstors = function (obj) {
  var pr = obj;
  while (pr = pr.prototype) {
    console.log(pr.name || pr);
  }
};

var printMethods = function (klass) {
  var methods = [];
  for (var prop in klass) {
    if (typeof klass[prop] == 'function') methods.push(prop);
  }
  console.log(methods);
}

prependPrototype(myClass, CanYo);
prependPrototype(myClass, CanMiu);

//printAncesstors(myClass);
//printMethods(myClass);

var f2 = function f2 () {};
f2.prototype.f2 = true;
f2.prototype.isF2 = function() { return true; }

var f3 = function f3 () {};
f3.prototype.f3 = true;
f3.prototype.isF3 = function() { return true; }

f2.prototype.constructor = f3;

/*
var cloneYo = cloneToFunction(CanYo);
cloneYo.prototype.prototype = cloneToFunction(CanMiu);

f2.prototype.constructor = cloneYo;
*/

printMethods(new f2);

var something = new f2;

console.log(something.f2);
console.log(something.f3);

/*
my_function
  .prototype
    .constructor == my_function
      .prototype == my_function.prototype
*/