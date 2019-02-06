require('./test_helper')

describe('Model.Column', () => {

  before(async () => {
    await testConnection()
  })

  afterEach(async () => {
    await cleanupSchema()
  })

  it('should create column', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = new Model.Column({
      table: table,
      name: 'some_column',
      type: 'character varying',
      max_length: 100,
      default_value: "foo",
      allow_null: false
    })

    await column.create()

    column = await table.getColumnObj(column.name)

    assert.deepEqual(column.attributes, {
      name: 'some_column',
      type: 'character varying',
      default_value: "'foo'::character varying",
      max_length: 100,
      allow_null: false
    })

    await table.drop()
  })

  it('should fetch numeric column length with scale', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = new Model.Column({
      table: table,
      name: 'some_column',
      type: 'numeric',
      max_length: '10,5',
      allow_null: false
    })

    await column.create()

    column = await table.getColumnObj(column.name)

    assert.deepEqual(column.attributes, {
      name: 'some_column',
      type: 'numeric',
      default_value: null,
      max_length: '10,5',
      allow_null: false
    })

    await table.drop()
  })

  it('should fetch timestamp column length', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = new Model.Column({
      table: table,
      name: 'some_column',
      type: 'timestamp',
      max_length: '5',
      allow_null: false
    })

    await column.create()

    column = await table.getColumnObj(column.name)

    assert.deepEqual(column.attributes, {
      name: 'some_column',
      type: 'timestamp without time zone',
      default_value: null,
      max_length: '5',
      allow_null: false
    })

    await table.drop()
  })

  it('should fetch timestamp column length', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = new Model.Column({
      table: table,
      name: 'some_column',
      type: 'timestamp',
      max_length: '5',
      allow_null: false
    })

    await column.create()

    column = await table.getColumnObj(column.name)

    assert.deepEqual(column.attributes, {
      name: 'some_column',
      type: 'timestamp without time zone',
      default_value: null,
      max_length: '5',
      allow_null: false
    })

    await table.drop()
  })

  it('should recognize default timestamp column length', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = new Model.Column({
      table: table,
      name: 'some_column',
      type: 'interval',
      allow_null: false
    })

    await column.create()

    column = await table.getColumnObj(column.name)

    assert.deepEqual(column.attributes, {
      name: 'some_column',
      type: 'interval',
      default_value: null,
      max_length: null,
      allow_null: false
    })

    await table.drop()
  })

  it('should make virtual attributes', () => {
    var column = new Model.Column({
      name: 'some_column',
      type: 'integer',
      default_value: 0,
      max_length: 5,
      allow_null: true
    })

    assert.equal(column.data.column_name, 'some_column')
    assert.equal(column.data.data_type, 'integer')
    assert.equal(column.data.column_default, 0)
    assert.equal(column.data.character_maximum_length, 5)
    assert.equal(column.data.is_nullable, 'YES')
  })

  // deprecated, use Model.Column.create
  it('table.addColumnObj should create column', async () => {
    var table = await Model.Table.create('public', 'test_table')
    await Model.Column.create({
      table: table,
      name: 'some_column',
      type: 'integer',
      default_value: 0,
      allow_null: true
    })

    var names = await table.getColumnNames()
    assert.deepEqual(names, ['id', 'some_column'])
    await table.drop()
  })

  it('Column.create should return correct column object', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = await Model.Column.create({ name: 'some_column', table: table, type: 'integer' })

    var otherColumn = await table.getColumnObj(column.name)

    // table deference
    assert.equal(otherColumn.table, table)

    // attributes
    assert.equal(otherColumn.name,           column.name)
    assert.equal(otherColumn.type,           column.type)
    assert.equal(otherColumn.allow_null,     column.allow_null)
    // TODO: Make sure it always null or always undefined
    //assert.equal(other_column.default_value,  column.default_value)

    await table.drop()
  })

  it('should delete column', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = new Model.Column({ name: 'some_column', type: 'integer' })

    await table.addColumnObj(column)

    assert.deepEqual(await table.getColumnNames(), ['id', 'some_column'])

    await column.drop()

    assert.deepEqual(await table.getColumnNames(), ['id'])

    await table.drop()
  })

  it('should update column attributes', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = new Model.Column({ name: 'some_column', type: 'integer', allow_null: false })

    column = await table.addColumnObj(column)

    column.name = 'some_column2'
    column.allow_null = true
    column.type = 'character varying'
    column.default_value = "Foo"
    column.max_length = 30

    assert.deepEqual(column.changes, {
      name: ["some_column", "some_column2"],
      allow_null: [false, true],
      type: ["integer", "character varying"],
      default_value: [undefined, "Foo"],
      max_length: [undefined, 30]
    })

    await column.save()

    var names = await table.getColumnNames()
    assert.deepEqual(names, ['id', 'some_column2'])

    var column2 = await table.getColumnObj('some_column2')

    assert.equal(column2.type, 'character varying')
    assert.equal(column2.max_length, 30)
    // here is little magic with default value, it comes with type in postgres
    assert.equal(column2.default_value, "'Foo'::character varying")
    assert(column2.allow_null)

    await table.drop()
  })

  it('should have getter "attributes"', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = new Model.Column({ name: 'some_column', type: 'integer', allow_null: false })

    column = await table.addColumnObj(column)

    assert.deepEqual(column.attributes, {
      name: 'some_column',
      type: 'integer',
      default_value: undefined,
      max_length: undefined,
      allow_null: false
    })

    await table.drop()
  })

  it('should make it syncroniously', async () => {
    var table = await Model.Table.create('public', 'test_table')

    assert.equal(table.table, 'test_table')

    var columnData = new Model.Column({ name: 'some_column', type: 'integer', allow_null: false })

    var column = await table.addColumnObj(columnData)

    assert.deepEqual(column.attributes, {
      name: 'some_column',
      type: 'integer',
      default_value: undefined,
      max_length: undefined,
      allow_null: false
    })

    await table.drop()
  })

  it('should update column', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var columnData = new Model.Column({ name: 'some_column', type: 'integer', allow_null: false })

    var column = await table.addColumnObj(columnData)

    await column.update({name: 'some_column2', type: 'text', allow_null: true, default_value: '123'})

    var updated = await table.getColumnObj('some_column2')

    // TODO: consistent properties
    assert.equal(updated.data.column_name, 'some_column2')
    assert.equal(updated.data.data_type, 'text')
    assert.equal(updated.data.column_default, "'123'::text")
    assert.equal(updated.data.is_nullable, 'YES')

    await table.drop()
  })

  it('should update varchar length', async () => {
    var table = await Model.Table.create('public', 'test_table')
    var column = await Model.Column.create({
      table: table,
      name: 'some_column',
      type: 'character varying',
      max_length: 100,
      default_value: "foo",
      allow_null: true
    })

    column.max_length = 200;
    await column.save()

    var updated = await table.getColumnObj('some_column')

    assert.equal(updated.max_length, 200)

    await table.drop()
  })

  it("should get list of types", async () => {
    var types = await Model.Column.availableTypes()

    assert.deepEqual(
      types.find(t => { return t.name == 'text' }),
      { schema: 'pg_catalog',
        name: 'text',
        description: 'variable-length string, no limit specified',
        udt_name: 'text'
      }
    )
  })

  it('should create column with upper case', async () => {
    var table = await Model.Table.create('public', 'test_table')
    await Model.Column.create({
      table: table,
      name: 'Some_Column',
      type: 'character varying',
    })

    assert.deepEqual(await table.getColumnNames(), ['id', 'Some_Column'])
  })

  it('should alter column with upper name', async () => {
    var table = await Model.Table.create('public', 'Test_Table')
    var columnData = new Model.Column({ name: 'Some_Column', type: 'integer', allow_null: false })

    var column = await table.addColumnObj(columnData)

    await column.update({name: 'Some_Column2', type: 'text', allow_null: true, default_value: '123'})

    var updated = await table.getColumnObj('Some_Column2')
    assert.equal(updated.type, 'text');
    assert.equal(updated.allow_null, true);
    assert.equal(updated.default_value, "'123'::text");

    await table.drop()
  })
})
