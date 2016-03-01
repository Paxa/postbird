describe('Model.Table', do

  it('should create and drop table', do |done|
    Model.Table.create('public', 'test_table', do |table, res, error|
      assert_true(error == undefined)

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

  sync_it("should count rows", do
    var table = Model.Table.create('public', 'test_table', {empty: true})
    table.addColumnObj(Model.Column('some_column', {data_type: 'integer', null: true}));

    table.insertRow([1])
    table.insertRow([2])
    table.insertRow([3])

    assert(table.getTotalRows(), 3)

    table.drop()
  end)

  sync_it("should generate source sql", do
    var table = Model.Table.create('public', 'test_table', {empty: true})
    table.addColumnObj(Model.Column('some_column', {data_type: 'integer'}));

    table.runSyncCb('getSourceSql', do |sql|
      assert_contain(sql, 'CREATE TABLE test_table')
    end)
    table.drop()
  end)

  sync_it("should insert row", do
    var table = Model.Table.create('public', 'test_table', {empty: true})
    table.addColumnObj(Model.Column('some_number', {data_type: 'integer'}));
    table.addColumnObj(Model.Column('some_column', {data_type: 'text'}));

    var res = table.insertRow({some_number: 123, some_column: 'bob'})

    rows = table.getRows()
    assert(rows.rowCount, 1)
    assert(rows.rows[0], { ctid: rows.rows[0].ctid, some_number: 123, some_column: 'bob' })

    table.drop()
  end)

  sync_it("should select from views", do
    var sql = "create view myview as select * from pg_available_extensions"
    Model.base.q(sql)

    var table = new Model.Table('public', 'myview')

    var res = table.getRows()

    assert(res.rows.length > 0, true)
    table.drop()
  end)

  sync_it("should detect if relation is view", do
    var sql = "create view myview as select * from pg_available_extensions"
    Model.base.q(sql)

    var table = new Model.Table('public', 'myview')

    assert(table.isView(), true)
    assert(table.isMatView(), false)
    assert(table.getTableType(), 'VIEW')
    table.drop()
  end)

  if Connection.instances[0].supportMatViews()
    sync_it("should detect if relation is view", do
      var sql = "create materialized view myview as select * from pg_available_extensions"
      Model.base.q(sql)

      var table = new Model.Table('public', 'myview')

      assert(table.isView(), false)
      assert(table.isMatView(), true)
      assert(table.getTableType(), 'MATERIALIZED VIEW')
      table.drop()
    end)
  end

end)