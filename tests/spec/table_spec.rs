require "../../app/models/base"
require "../../app/models/table"


describe('fetcher.fetcher', do
  //@timeout(50000)

  it('should describe table', do |done|
    //Model.Table('schema', 'test_table').drop();
    Model.Table.create('public', 'test_table', do |table, res, error|
      assert_true(error === undefined)
      table.drop(do |res, error|
        assert_true(error === undefined)
        done()
      end)
    end)
  end)
end)