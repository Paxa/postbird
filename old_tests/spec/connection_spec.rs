require "../../app/connection"


describe('Connection', do
  it("should work with mutliple qieries", do |done|
    Fiber(do
      var result = connection.wrapSync('q')('select 1 as one; select 2 as two;');

      assert(result.rows.length, 2);
      assert(result.rows[0], {"one": 1});
      assert(result.rows[1], {"two": 2});
      done();
    end).run()
  end)

end)