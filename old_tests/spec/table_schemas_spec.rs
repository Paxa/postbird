describe('Model.Table and Model.Schema', do

  bdd.before(do |done|
    Model.Schema("my_schema_1").drop({}, do
      Model.Schema("my_schema_2").drop({}, do
        done()
      end)
    end)
  end)

  sync_it("should run describe within schema", do
    var schema1 = Model.Schema.create("my_schema_1")
    var schema2 = Model.Schema.create("my_schema_2")

    var table1 = Model.Table.create('my_schema_1', 'test_table', {empty: true})
    table1.addColumnObj(Model.Column('foo', {data_type: 'integer', null: true}))
    table1.addIndex('idx_foo', false, 'foo', 'btree')

    var table2 = Model.Table.create('my_schema_2', 'test_table', {empty: true})
    table2.addColumnObj(Model.Column('bar', {data_type: 'text', null: true}))
    table2.addIndex('idx_bar_123', false, 'bar', 'btree')

    assert(table1.getColumnNames(), ['foo'])
    assert(table2.getColumnNames(), ['bar'])

    var result1 = table1.describe()
    var result2 = table2.describe()

    assert(result1.map(function (r) { return r.relname; }), ['idx_foo'])
    assert(result2.map(function (r) { return r.relname; }), ['idx_bar_123'])
  end)

  sync_it("should rename table in schemas", do
    var schema1 = Model.Schema.create("my_schema_1")
    var schema2 = Model.Schema.create("my_schema_2")

    var table1 = Model.Table.create('my_schema_1', 'test_table', {empty: true})
    var table2 = Model.Table.create('my_schema_2', 'test_table', {empty: true})

    table1.rename('test_table_renamed')

    assert(schema1.getTableNames(), ['test_table_renamed'])
    assert(schema2.getTableNames(), ['test_table'])
  end)

  sync_it("should rename table in schemas", do
    var schema1 = Model.Schema.create("my_schema_1")
    var schema2 = Model.Schema.create("my_schema_2")

    var table1 = Model.Table.create('my_schema_1', 'test_table', {empty: true})
    var table2 = Model.Table.create('my_schema_2', 'test_table', {empty: true})

    table1.rename('test_table_renamed')

    table1.remove()

    assert(schema1.getTableNames(), [])
    assert(schema2.getTableNames(), ['test_table'])
  end)

  if Connection.instances[0].supportMatViews()
    sync_it("should delete views and mat views in schemas", do
      var schema1 = Model.Schema.create("my_schema_1")
      Model.base.q("create view my_schema_1.my_view as select * from pg_available_extensions")
      Model.base.q("create materialized view my_schema_1.my_mat_view as select * from pg_available_extensions")

      Model.Table('my_schema_1', 'my_view').drop()
      Model.Table('my_schema_1', 'my_mat_view').drop()

      assert(schema1.getTableNames(), [])
    end)
  end

  sync_it("should fetch primary key in schemas", do
    var schema1 = Model.Schema.create("my_schema_1")
    var schema2 = Model.Schema.create("my_schema_2")

    var table1 = Model.Table.create('my_schema_1', 'test_table')
    var table2 = Model.Table.create('my_schema_2', 'test_table', {empty: true})

    assert(table1.getPrimaryKey().length, 1)
    assert(table1.getPrimaryKey()[0], {attname: 'id'})
    assert(table2.getPrimaryKey(), false)
  end)

  sync_it("should get source sql", do
    var schema1 = Model.Schema.create("my_schema_1")
    var schema2 = Model.Schema.create("my_schema_2")

    var table1 = Model.Table.create('my_schema_1', 'test_table')
    var table2 = Model.Table.create('my_schema_2', 'test_table', {empty: true})

    assert_contain(table1.getSourceSql(), 'CREATE TABLE test_table')
  end)

  sync_it("should insert and select", do
    var schema1 = Model.Schema.create("my_schema_1")
    var schema2 = Model.Schema.create("my_schema_2")

    var table1 = Model.Table.create('my_schema_1', 'test_table')
    table1.addColumnObj(Model.Column('foo', {data_type: 'integer', null: true}))

    var table2 = Model.Table.create('my_schema_2', 'test_table', {empty: true})

    table1.insertRow({foo: 123})
    var data = table1.getRows().rows
    assert(table1.getTotalRows(), 1)
    assert(data[0], {ctid: data[0].ctid, id: 1, foo: 123})

    table1.deleteRowByCtid(data[0].ctid)
    assert(table1.getTotalRows(), 0)
  end)
end)