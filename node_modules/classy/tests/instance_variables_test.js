describe("Instance variables", function() {
  it('should have #instance_variable_names property', function() {
    var Cat = Classy.build('Cat');
    var cat = new Cat;
    assert(cat.instance_variable_names, []);

    cat.isCat = true;
    assert(cat.instance_variable_names, ['isCat']);

    var Dog = Classy.build('Dog', function() {
      this.isDog = true;
      this.isCat = false;
    });
    assert((new Dog).instance_variable_names, ['isDog', 'isCat']);
  });

  it('should have #instance_variables property', function() {
    var Cat = Classy.build('Cat');
    var cat = new Cat;
    assert(cat.instance_variables, {});
    cat.isCat = true;
    assert(cat.instance_variables, {isCat: true});
  });
});