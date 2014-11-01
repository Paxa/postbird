describe('Classy basics', function() {
  it('create class and run initializer', function () {

    var Cat = Classy.build('Cat', function (proto, mutator) {
      proto.init_ran = false;
      proto.initialize = function() {
        this.init_ran = true;
      };
    });

    assert_true((new Cat).init_ran);
  });

  it('create class and have "this" as constructor', function () {

    var Cat = Classy.build('Cat', function (proto, mutator) {
      this.init_ran = false;
      this.initialize = function() {
        this.init_ran = true;
      };
    });

    assert_true((new Cat).init_ran);
  });

  it('should give uniq object_id to every instance', function() {
    var Cat = Classy.build('Cat');
    var cat1 = new Cat;
    var cat2 = new Cat;
    assert_true(cat1.object_id != cat2.object_id);
  });

  it('should make class as named function', function() {
    var Cat = Classy.build('Cat');
    assert(Cat.name, 'Cat');
  });

  it('should #is_a() to detect class', function() {
    var Cat = Classy.build('Cat');
    var Dog = Classy.build('Dog');
    assert((new Cat).is_a(Cat), true);
    assert((new Cat).is_a(Dog), false);
  });

  it('should have method #tap', function() {
    var cat = new (Classy.build('Cat'));
    var returning = cat.tap(function() {
      assert(this, cat);
    });

    assert(returning, cat)
  });

  it('should have #klass property', function() {
    var Cat = Classy.build('Cat');
    var cat = new Cat;
    assert(cat.klass, Cat);
  });

  it('should have #klassName property', function() {
    var Cat = Classy.build('Cat');
    var cat = new Cat;
    assert(cat.klassName, 'Cat');
  });

  /*
  // deprecated
  // better use Object.getPrototypeOf(obj).constructor
  */
  it('should return parent class', function () {
    var Cat = Classy.build('Cat');
    assert(Cat.superclass, Classy.BaseKlass);
  });

  it('should allocate new object without running initialize', function() {
    var Cat = Classy.build('Cat', function() {
      this.initialized = false;
      this.initialize = function () {
        this.initialized = true;
      }
    });

    assert((new Cat).initialized, true);
    var allocated = Cat.allocate();
    assert(allocated.initialized, false);
    assert_true(!!allocated.object_id);
  });

  it('should have property #methods', function() {
    var Cat = Classy.build('Cat');
    var methods = (new Cat).methods;

    assert_contain(methods, 'inspect');
    assert_contain(methods, 'is_a');
    assert_contain(methods, 'tap');
    assert_contain(methods, 'initialize');
  });

  it('should be inherited', function() {
    var Cat = Classy.build('Cat');
    var aCat = new Cat;
    assert_true(aCat instanceof Cat);
    assert(aCat.constructor, Cat);

    var Rabbit = Classy.build('Rabbit');
    var aRabbit = new Rabbit;
    assert_true(aRabbit instanceof Rabbit);
    assert(aRabbit.constructor, Rabbit);
  });

  it('should have property #properties', function() {
    var Cat = Classy.build('Cat');
    var properties = (new Cat).properties;

    assert_contain(properties, "object_id");
    assert_contain(properties, "instance_variable_names");
    assert_contain(properties, "instance_variables");
    assert_contain(properties, "methods");
    assert_contain(properties, "properties");
    assert_contain(properties, "klass");
    assert_contain(properties, "klassName");
  });
});