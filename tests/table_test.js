require('./test_helper');

describe('Model.Table', () => {

  before(async () => {
    await testConnection();
  });

  afterEach(async () => {
    await cleanupSchema();
  });

  it('should create and drop table', async () => {
    var table = await Model.Table.create('public', 'test_table');

    var tables = await Model.Table.publicTables();

    assert.deepEqual(tables, ['test_table']);

    await table.drop();

    tables = await Model.Table.publicTables();
    assert.deepEqual(tables, []);
  })

  it('should rename table', async () => {
    var table = await Model.Table.create('public', 'test_table');

    await table.rename('test_table2');

    var tables = await Model.Table.publicTables();

    assert.deepEqual(tables, ['test_table2']);
    assert.equal(table.table, 'test_table2');

    await table.drop();
  })

  it('should show describe table', async () => {
    var table = await Model.Table.create('public', 'test_table');

    var indexes = await table.getIndexes();

    assert.equal(indexes[0].indisprimary, true)
    assert.equal(indexes[0].indisunique, true)
    assert.equal(indexes[0].pg_get_indexdef, 'CREATE UNIQUE INDEX test_table_pkey ON test_table USING btree (id)')

    await table.drop();
  })

  it("should count rows", async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})
    await table.addColumnObj(Model.Column('some_column', {data_type: 'integer', null: true}));

    await table.insertRow([1])
    await table.insertRow([2])
    await table.insertRow([3])

    assert.equal(await table.getTotalRows(), 3)

    await table.drop()
  })

  it("should generate source sql", async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})
    await table.addColumnObj(Model.Column('some_column', {data_type: 'integer'}));

    var sql = await new Promise((resolve, reject) => {
      table.getSourceSql(resolve);
    });

    assert.contain(sql, 'CREATE TABLE test_table');

    await table.drop();
  })

  it("should insert row", async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})
    await table.addColumnObj(Model.Column('some_number', {data_type: 'integer'}));
    await table.addColumnObj(Model.Column('some_column', {data_type: 'text'}));

    await table.insertRow({some_number: 123, some_column: 'bob'})

    var rows = await table.getRows()
    assert.equal(rows.rowCount, 1)
    assert.deepEqual(rows.rows[0], { ctid: rows.rows[0].ctid, some_number: 123, some_column: 'bob' })

    await table.drop()
  })

  it("should select from views", async () => {
    var sql = "create view myview as select * from pg_available_extensions"
    await Model.base.q(sql)

    var table = new Model.Table('public', 'myview')

    var res = await table.getRows()

    assert(res.rows.length > 0)
    await table.drop()
  })

  it("should detect if relation is view", async () => {
    var sql = "create view myview as select * from pg_available_extensions"
    await Model.base.q(sql)

    var table = new Model.Table('public', 'myview')

    assert.equal(await table.isView(), true)
    assert.equal(await table.isMatView(), false)
    assert.equal(await table.getTableType(), 'VIEW')
    await table.drop()
  })

  it("should detect if relation is view", async () => {
    if (Connection.instances[0].supportMatViews()) {
      var sql = "create materialized view myview as select * from pg_available_extensions"
      await Model.base.q(sql)

      var table = new Model.Table('public', 'myview')

      assert.equal(await table.isView(), false)
      assert.equal(await table.isMatView(), true)
      assert.equal(await table.getTableType(), 'MATERIALIZED VIEW')
      table.drop()
    } else {
      console.log("Skip test, not mat view support");
    }
  })

  it("should truncate table", async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})
    await table.addColumnObj(Model.Column('some_number', {data_type: 'integer'}))
    await table.addColumnObj(Model.Column('some_column', {data_type: 'text'}))

    await table.insertRow({some_number: 123, some_column: 'bob'})
    assert.equal((await table.getRows()).rowCount, 1)

    await table.truncate()

    assert.equal((await table.getRows()).rowCount, 0)
    await table.drop()
  })

})