describe("Classy mixins", function() {
  it('should include module (object)', function() {
    var Cat = Classy.build('Cat');
    Cat.include({ includedOne: true }, { includedTwo: true });

    //Classy.ls(Cat);

    assert_true((new Cat).includedOne);
    assert_true((new Cat).includedTwo);
  })
});