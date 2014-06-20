require "../../app/models/base"
require "../../app/models/table"


describe('Model.Table', do
  //@timeout(50000)

  it('should create and drop table', do |done|
    //Model.Table('schema', 'test_table').drop();
    Model.Table.create('public', 'test_table', do |table, res, error|
      assert_true(error === undefined)

      Model.Table.publicTables(do |tables|
        assert(tables, ['test_table']);

        table.drop(do |res, error|
          assert(error, undefined)

          Model.Table.publicTables(do |tables|
            assert(tables, []);
            done()
          end)
        end)
      end)
    end)
  end)

  it('should rename table', do |done|
    Model.Table.create('public', 'test_table', do |table, res, error|
      assert_true(error === undefined)
      table.rename('test_table2', do |error|
        Model.Table.publicTables(do |tables|
          assert(tables, ['test_table2'])
          assert(table.table, 'test_table2')
          table.drop(done)
        end)
      end)
    end)
  end)

  it('should show describe table', do |done|
    Model.Table.create('public', 'test_table', do |table, res, error|
      table.describe(do |data|
        assert(data[0].indisprimary, true)
        assert(data[0].indisunique, true)
        assert(data[0].pg_get_indexdef, 'CREATE UNIQUE INDEX test_table_pkey ON test_table USING btree (id)')
        table.drop(done)
      end)
    end)
  end)
end)