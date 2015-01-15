require "../../app/connection"


describe('Connection', do
  it("should work with mutliple qieries", do |done|
    Fiber(do
      assert(1, 1);
      done();
    end).run()
  end)

end)