require('./test_helper');

describe('Model.Index', () => {

  before(async () => {
    await testConnection()
  });

  afterEach(async () => {
    await cleanupSchema()
  });

  it('should get primary index', async () => {
    var table = await Model.Table.create('public', 'test_table')

    var indexes = await Model.Index.list(table)

    assert.equal(indexes.length, 1)
    assert.ok(indexes[0] instanceof Model.Index)
    assert.equal(indexes[0].name, 'test_table_pkey')
    assert.equal(indexes[0].indisprimary, true)
    assert.equal(indexes[0].indisunique, true)
    assert.equal(indexes[0].indisvalid, true)
    assert.equal(indexes[0].pg_get_indexdef, 'CREATE UNIQUE INDEX test_table_pkey ON test_table USING btree (id)')
    //assert.equal(indexes[0].pg_get_constraintdef, 'PRIMARY KEY (id)')
    assert.deepEqual(indexes[0].columns(), ['id'])

    await table.drop()
  })

  it('should create index', async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})
    await Model.Column.create({
      table: table,
      name: 'some_column',
      type: 'character varying',
    })
    await Model.Column.create({
      table: table,
      name: 'Other_Column',
      type: 'character varying',
    })

    await Model.Index.create(table, null, {
      columns: ['some_column', 'Other_Column'],
      uniq: true
    })

    var indexes = await Model.Index.list(table)

    assert.equal(indexes.length, 1)
    assert.ok(indexes[0] instanceof Model.Index)
    assert.equal(indexes[0].name, 'test_table_some_column_Other_Column_idx')
    assert.equal(indexes[0].indisprimary, false)
    assert.equal(indexes[0].indisunique, true)
    assert.equal(indexes[0].indisvalid, true)
    assert.equal(indexes[0].pg_get_indexdef, 'CREATE UNIQUE INDEX "test_table_some_column_Other_Column_idx" ' +
      'ON test_table USING btree (some_column, "Other_Column")')
    assert.deepEqual(indexes[0].columns(), ['some_column', 'Other_Column'])

    await table.drop()
  })

  it('should drop index', async () => {
    var table = await Model.Table.create('public', 'test_table', {empty: true})

    await Model.Column.create({
      table: table,
      name: 'some_column',
      type: 'character varying',
    })

    await Model.Index.create(table, 'example_index', {columns: ['some_column']})

    await (new Model.Index('example_index', table)).drop()

    var indexes = await Model.Index.list(table)
    assert.equal(indexes.length, 0)

    await table.drop()
  })
})