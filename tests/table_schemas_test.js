require('./test_helper');
require("../lib/pg_dump_runner");

describe('Model.Table and Model.Schema', () => {

  before(async () => {
    await testConnection();
  });

  beforeEach(async () => {
    try {
      await new Model.Schema("my_schema_1").drop();
    } catch (e) {
      console.error(e);
    }
    try {
      await new Model.Schema("my_schema_2").drop();
    } catch (e) {
      console.error(e);
    }
  });

  afterEach(async () => {
    await cleanupSchema();
  });

  it("should run describe within schema", async () => {
    var schema1 = await Model.Schema.create("my_schema_1")
    var schema2 = await Model.Schema.create("my_schema_2")

    var table1 = await Model.Table.create('my_schema_1', 'test_table', {empty: true})
    await table1.addColumnObj(Model.Column('foo', {data_type: 'integer', null: true}))
    await table1.addIndex('idx_foo', false, 'foo', 'btree')

    var table2 = await Model.Table.create('my_schema_2', 'test_table', {empty: true})
    await table2.addColumnObj(Model.Column('bar', {data_type: 'text', null: true}))
    await table2.addIndex('idx_bar_123', false, 'bar', 'btree')

    assert.deepEqual(await table1.getColumnNames(), ['foo'])
    assert.deepEqual(await table2.getColumnNames(), ['bar'])

    var result1 = await table1.getIndexes()
    var result2 = await table2.getIndexes()

    assert.deepEqual(result1.map(r => { return r.relname; }), ['idx_foo'])
    assert.deepEqual(result2.map(r => { return r.relname; }), ['idx_bar_123'])
  })

  it("should rename table in schemas", async () => {
    var schema1 = await Model.Schema.create("my_schema_1")
    var schema2 = await Model.Schema.create("my_schema_2")

    var table1 = await Model.Table.create('my_schema_1', 'test_table', {empty: true})
    var table2 = await Model.Table.create('my_schema_2', 'test_table', {empty: true})

    await table1.rename('test_table_renamed')

    assert.deepEqual(await schema1.getTableNames(), ['test_table_renamed'])
    assert.deepEqual(await schema2.getTableNames(), ['test_table'])
  })

  it("should remove table in schemas", async () => {
    var schema1 = await Model.Schema.create("my_schema_1")
    var schema2 = await Model.Schema.create("my_schema_2")

    var table1 = await Model.Table.create('my_schema_1', 'test_table', {empty: true})
    var table2 = await Model.Table.create('my_schema_2', 'test_table', {empty: true})

    await table1.remove()

    assert.deepEqual(await schema1.getTableNames(), [])
    assert.deepEqual(await schema2.getTableNames(), ['test_table'])
  })

  it("should delete views and mat views in schemas", async () => {
    if (getConnection().supportMatViews()) {
      var schema1 = await Model.Schema.create("my_schema_1")
      await Model.base.q("create view my_schema_1.my_view as select * from pg_available_extensions")
      await Model.base.q("create materialized view my_schema_1.my_mat_view as select * from pg_available_extensions")

      await new Model.Table('my_schema_1', 'my_view').drop()
      await new Model.Table('my_schema_1', 'my_mat_view').drop()

      assert.deepEqual(await schema1.getTableNames(), [])
    }
  })

  it("should fetch primary key in schemas", async () => {
    var schema1 = await Model.Schema.create("my_schema_1")
    var schema2 = await Model.Schema.create("my_schema_2")

    var table1 = await Model.Table.create('my_schema_1', 'test_table')
    var table2 = await Model.Table.create('my_schema_2', 'test_table', {empty: true})

    var pkey = await table1.getPrimaryKey();
    assert.deepEqual(pkey, [{attname: 'id'}]);
    assert.deepEqual(await table2.getPrimaryKey(), [])
  })

  it("should get source sql", async () => {
    var schema1 = await Model.Schema.create("my_schema_1")
    var schema2 = await Model.Schema.create("my_schema_2")

    var table1 = await Model.Table.create('my_schema_1', 'test_table')
    var table2 = await Model.Table.create('my_schema_2', 'test_table', {empty: true})

    assert.contain(await table1.getSourceSql(), 'CREATE TABLE test_table')
  })

  it("should insert and select", async () => {
    var schema1 = await Model.Schema.create("my_schema_1")
    var schema2 = await Model.Schema.create("my_schema_2")

    var table1 = await Model.Table.create('my_schema_1', 'test_table')
    await table1.addColumnObj(new Model.Column('foo', {data_type: 'integer', null: true}))

    var table2 = await Model.Table.create('my_schema_2', 'test_table', {empty: true})

    await table1.insertRow({foo: 123})
    assert.equal(await table1.getTotalRows(), 1)
    var data = (await table1.getRows()).rows
    assert.deepEqual(data[0], {ctid: data[0].ctid, id: 1, foo: 123})

    await table1.deleteRowByCtid(data[0].ctid)
    assert.equal(await table1.getTotalRows(), 0)
  })
})