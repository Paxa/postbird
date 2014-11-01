describe("object extras", function () {
  it("should return enumerable function as own method", function () {
    var obj = {};
    Object.defineProperty(obj, 'notEnumerable', {
      value: function () {},
      enumerable: false
    });
    assert(Object.own_methods(obj), ['notEnumerable']);
  });

  it("should return all method names", function () {
    var Foo = function () { };
    Foo.prototype.fooInstanceMethod = function () {};
    var obj = new Foo();
    obj.objOwnMethod = function () {};

    var globalObjMethods = Object.methods({});
    assert(Object.methods(obj), ['objOwnMethod', 'fooInstanceMethod'].concat(globalObjMethods));
  });

  it("should return own method names", function () {
    var Foo = function () { };
    Foo.prototype.fooInstanceMethod = function () {};
    var obj = new Foo();
    obj.objOwnMethod = function () {};

    assert(Object.own_methods(obj), ['objOwnMethod']);
  });

  // Object.dynamicProperties
  it('should return dynamic properties', function () {
    var obj = new Function;
    Object.defineProperty(obj, 'dynamicProp', {
      get: function () { return 'yes'; }
    });

    assert(Object.dynamicProperties(obj), ['dynamicProp']);
  });

  it('should return dynamic properties from ancestors too', function () {
    var obj = new Function;
    Object.defineProperty(obj, 'dynamicProp', {
      get: function () { return 'yes'; }
    });

    var obj2 = new Function;
    Object.defineProperty(obj, 'dynamicProp2', {
      get: function () { return 'yes'; }
    });

    Classy.inherits(obj2, obj);

    assert(Object.dynamicProperties(obj), ['dynamicProp', 'dynamicProp2']);
  });

  // Object.realType
  it('should detect real type', function () {
    // standart
    assert(Object.realType('s'),       'string');
    assert(Object.realType(1),         'number');
    assert(Object.realType(undefined), 'undefined');
    assert(Object.realType(true),      'boolean');
    assert(Object.realType(false),     'boolean');
    assert(Object.realType(assert),    'function');
    // extras
    assert(Object.realType([]),       'array');
    assert(Object.realType(null),     'null');
    assert(Object.realType(new Date), 'date');
    assert(Object.realType(/aaa/),    'regexp');

    assert(Object.realType(String),   'class');
    assert(Object.realType(Boolean),  'class');
    assert(Object.realType(Object),   'class');

    var myClass = new Function;
    myClass.prototype.a = 1;
    assert(Object.realType(myClass), 'class');
  });


  // Object.values
  it("should get object's values", function () {
    assert(Object.values({v1: 1, v2: 2, v3: 3, v4: 4}), [1, 2, 3, 4]);
  });

  // Object.own_properties
  it('should get own properties', function () {
    var f = new Function;
    assert(Object.own_properties(new f), []);
    assert(Object.own_properties(f), ["length", "name", "arguments", "caller", "prototype"]);

    var obj = {a: 123};
    Object.defineProperty(obj, 'ggg', {value: 123});
    assert(Object.own_properties(obj), ['ggg']);

    assert(Object.own_properties(Function.prototype), ["length","name","arguments","caller","constructor"]);
    assert(Object.own_properties(true), []);
    assert(Object.own_properties(1),    []);
    assert(Object.own_properties('a'),  []);
    assert(Object.own_properties(null), []);
  });

  // Object.properties
  it('should get all properties', function () {
    var f = new Function;
    assert(Object.properties(new f), ["constructor", "__proto__"]);
    assert(Object.properties([]), ["length", "constructor", "__proto__"]);
    assert(Object.properties(null), []);
    assert(Object.properties(true), ['constructor', '__proto__']);
    assert(Object.properties(false), ['constructor', '__proto__']);
    assert_true(Object.properties('').length > 0); // it shows all colors
  });

  // Object.ancestors
  it('should return ancesstors', function () {
    var f = function fff () {};
    assert(Object.ancestors(f), [Function, Object]);
    assert(Object.ancestors(new f), [f, Object]);

    assert(Object.ancestors(null),      []);
    assert(Object.ancestors(undefined), []);
    assert(Object.ancestors(1),         [Number, Object]);
    assert(Object.ancestors('ss'),      [String, Object]);
    assert(Object.ancestors([]),        [Array, Object]);
    assert(Object.ancestors(true),      [Boolean, Object]);
    assert(Object.ancestors(false),     [Boolean, Object]);
  });
});