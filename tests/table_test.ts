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

    var tables = await TestHelper.publicTables();

    assert.deepEqual(tables, ['test_table']);

    await table.drop();

    tables = await TestHelper.publicTables();
    assert.deepEqual(tables, []);
  })

  it('should rename table', async () => {
    var table = await Model.Table.create('public', 'test_table');

    await table.rename('test_table2');

    var tables = await TestHelper.publicTables();

    assert.deepEqual(tables, ['test_table2']);
    assert.equal(table.table, 'test_table2');

    await table.drop();
  })

  it("should count rows", async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})
    await table.addColumnObj(new Model.Column('some_column', {data_type: 'integer', null: true}));

    await table.insertRow([1])
    await table.insertRow([2])
    await table.insertRow([3])

    assert.equal(await table.getTotalRows(), 3)

    await table.drop()
  })

  it("should generate source sql", async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})
    await table.addColumnObj(new Model.Column('some_column', {data_type: 'integer'}));

    var sql: any = await new Promise((resolve, reject) => {
      table.getSourceSql(resolve);
    });

    sql = sql.replace(/public\.test_table/g, 'test_table')
    assert.contain(sql, 'CREATE TABLE test_table');

    await table.drop();
  })

  it("should insert row", async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})
    await table.addColumnObj(new Model.Column('some_number', {data_type: 'integer'}));
    await table.addColumnObj(new Model.Column('some_column', {data_type: 'text'}));

    await table.insertRow({some_number: 123, some_column: 'bob'})

    var rows = await table.getRows()
    assert.equal(rows.rowCount, 1)
    assert.deepEqual(rows.rows[0], { ctid: rows.rows[0].ctid, some_number: 123, some_column: 'bob' })

    await table.drop()
  })

  it("should select from views", async () => {
    var sql = "create view myview as select * from pg_available_extensions"
    await ModelBase.q(sql)

    var table = new Model.Table('public', 'myview')

    var res = await table.getRows()

    assert(res.rows.length > 0)
    await table.drop()
  })

  it("should detect if relation is view", async () => {
    var sql = "create view myview as select * from pg_available_extensions"
    await ModelBase.q(sql)

    var table = new Model.Table('public', 'myview')

    assert.equal(await table.isView(), true)
    assert.equal(await table.isMatView(), false)
    assert.equal(await table.getTableType(), 'VIEW')
    await table.drop()
  })

  it("should detect if relation is view", async () => {
    if (Connection.instances[0].supportMatViews()) {
      var sql = "create materialized view myview as select * from pg_available_extensions"
      await ModelBase.q(sql)

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
    await table.addColumnObj(new Model.Column('some_number', {data_type: 'integer'}))
    await table.addColumnObj(new Model.Column('some_column', {data_type: 'text'}))

    await table.insertRow({some_number: 123, some_column: 'bob'})
    assert.equal((await table.getRows()).rowCount, 1)

    await table.truncate()

    assert.equal((await table.getRows()).rowCount, 0)
    await table.drop()
  })

  it("should handle upper case in names", async () => {
    var table = await Model.Table.create('public', 'Test_Table')
    await table.addColumnObj(new Model.Column('Some_Number', {data_type: 'integer'}))
    await table.addColumnObj(new Model.Column('Some_Column', {data_type: 'text'}))

    await table.insertRow({Some_Number: 123, Some_Column: 'bob'})

    assert.equal(await table.isView(), false)
    assert.equal(await table.isMatView(), false)
    assert.equal(await table.getTableType(), 'BASE TABLE')

    assert.deepEqual(await table.getColumnNames(), ['id', 'Some_Number', 'Some_Column'])
    assert.deepEqual(
      (await table.getStructure()).map(col => { return col.column_name }),
      ['id', 'Some_Number', 'Some_Column']
    )

    assert.deepEqual(await table.getPrimaryKey(), [{attname: 'id'}])

    await table.drop()
  })

  it("should rename table", async () => {
    var table = await Model.Table.create('public', 'Test_Table')

    await table.rename("Test_Table2")

    assert.equal(table.table, "Test_Table2")
    await table.drop()
  })

  it("should rename view", async () => {
    var sql = `CREATE VIEW "Test_View" AS SELECT * FROM pg_available_extensions`
    await ModelBase.q(sql)

    var view = new Model.Table('public', 'Test_View')

    await view.rename("Test_View2")

    assert.equal(view.table, "Test_View2")
    await view.drop()
  })

  it("should get disk summary", async () => {
    var table = await Model.Table.create('public', 'test_table')

    var summary = await table.diskSummary();
    assert.equal(summary.type, 'table');
    assert.ok(summary.estimateCount === 0 || summary.estimateCount === -1);
    assert.greaterThen(summary.diskUsage.total, 1);
    assert.greaterThen(summary.diskUsage.index, 1);
  })

  it("should updateValue with uuid", async () => {
    var table = await Model.Table.create('public', 'test_table')
    await table.addColumnObj(new Model.Column('something', {data_type: 'uuid'}))

    await table.insertRow({something: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"})
    var data = await table.getRows(0, 10, this.queryOptions);

    var res = await table.updateValue(data.rows[0].ctid, 'something', "eeeeaaaa-bbbb-4ef8-bb6d-6bb9bd380a11")
    var data2 = await table.getRows(0, 10, this.queryOptions);

    assert.equal(res.rowCount, 1)
    assert.equal(data2.rows[0].something, "eeeeaaaa-bbbb-4ef8-bb6d-6bb9bd380a11")
  })

  it("should deleteRowByCtid", async () => {
    var table = await Model.Table.create('public', 'test_delete_tbl')
    await table.addColumnObj(new Model.Column('val', {data_type: 'integer'}))

    await table.insertRow({val: 100})
    await table.insertRow({val: 200})
    var rows = await table.getRows(0, 10, this.queryOptions);
    assert.equal(rows.rows.length, 2);

    await table.deleteRowByCtid(rows.rows[0].ctid);
    var rowsAfter = await table.getRows(0, 10, this.queryOptions);
    assert.equal(rowsAfter.rows.length, 1);
    assert.equal(rowsAfter.rows[0].val, 200);

    await table.drop();
  })

  it("should truncate table", async () => {
    var table = await Model.Table.create('public', 'test_trunc_tbl')
    await table.addColumnObj(new Model.Column('val', {data_type: 'integer'}))

    await table.insertRow({val: 1})
    await table.insertRow({val: 2})
    assert.equal(await table.getTotalRows(), 2);

    await table.truncate();
    assert.equal(await table.getTotalRows(), 0);

    await table.drop();
  })

  it("should getStructure, getColumnTypes, getColumnNames", async () => {
    var table = await Model.Table.create('public', 'test_struct_tbl')
    await table.addColumnObj(new Model.Column('name', {data_type: 'text'}))
    await table.addColumnObj(new Model.Column('age', {data_type: 'integer'}))

    var names = await table.getColumnNames();
    assert.contain(names, 'name');
    assert.contain(names, 'age');

    var types = await table.getColumnTypes();
    assert.equal(types.name.data_type, 'text');
    assert.equal(types.age.data_type, 'integer');

    var structure = await table.getStructure();
    assert.ok(Array.isArray(structure));
    assert.ok(structure.some(col => col.column_name == 'name'));
    assert.ok(structure.some(col => col.column_name == 'age'));

    await table.drop();
  })

  it("should inspect sequence", async () => {
    await ModelBase.q("CREATE SEQUENCE public.test_counter_seq START 1;");
    var seq = new Model.Table('public', 'test_counter_seq');

    var isSeq = await seq.isSequence();
    assert.equal(isSeq, true);

    var info = await seq.sequenceInfo();
    assert.ok(info);
    assert.equal(info.sequence_name, 'test_counter_seq');

    await ModelBase.q("DROP SEQUENCE public.test_counter_seq;");
  })

})