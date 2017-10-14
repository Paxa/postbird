require('./test_helper');

describe('Model.Column', () => {

  before(async () => {
    await testConnection();
  });

  afterEach(async () => {
    await cleanupSchema();
  });

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

  it('table.addColumnObj should return column object', (done) => {
    Model.Table.create('public', 'test_table', (table, res, error) => {
      var column = Model.Column({
        name: 'some_column',
        type: 'integer',
        default_value: 0,
        allow_null: true
      })

      table.addColumnObj(column, (column) => {
        table.getColumnNames((names) => {
          assert.deepEqual(names, ['id', 'some_column'])
          table.drop(() => { done() });
        })
      })
    })
  })

  it('table.addColumnObj should return correct column object', (done) => {
    Model.Table.create('public', 'test_table', (table, res, error) => {
      var column = Model.Column({ name: 'some_column', type: 'integer' })
      table.addColumnObj(column, (column) => {
        table.getColumnObj(column.name, (other_column) => {

          // table deference
          assert.equal(other_column.table, table)

          // attributes
          assert.equal(other_column.name,           column.name)
          assert.equal(other_column.type,           column.type)
          assert.equal(other_column.allow_null,     column.allow_null)
          // TODO: Make sure it always null or always undefined
          //assert.equal(other_column.default_value,  column.default_value)

          table.drop(() => { done() });
        });
      })
    })
  })

  it('column.drop should remove column', (done) => {
    Model.Table.create('public', 'test_table', (table, res, error) => {
      var column = Model.Column({ name: 'some_column', type: 'integer' })
      table.addColumnObj(column, (column) => {
        column.drop(() => {
          table.getColumnNames((names) => {
            assert.deepEqual(names, ['id'])
            table.drop(() => { done() });
          })
        })
      })
    })
  })

  it('should update column attributes', (done) => {
    Model.Table.create('public', 'test_table', (table, res, error) => {
      var column = Model.Column({ name: 'some_column', type: 'integer', allow_null: false })
      table.addColumnObj(column, (column) => {
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

        column.save(() => {
          table.getColumnNames((names) => {
            assert.deepEqual(names, ['id', 'some_column2'])
            table.getColumnObj('some_column2', (column2) => {
              assert.equal(column2.type, 'character varying')
              assert.equal(column2.max_length, 30)
              // here is little magic with default value, it comes with type in postgres
              assert.equal(column2.default_value, "'Foo'::character varying")
              assert(column2.allow_null)
              table.drop(() => { done() });
            })
          })
        })
      })
    })
  })

  it('should have getter "attributes"', (done) => {
    Model.Table.create('public', 'test_table', (table, res, error) => {
      var column = Model.Column({ name: 'some_column', type: 'integer', allow_null: false })
      table.addColumnObj(column, (column) => {
        assert.deepEqual(column.attributes, {
          name: 'some_column',
          type: 'integer',
          default_value: undefined,
          max_length: undefined,
          allow_null: false
        })
        table.drop(() => { done() });
      })
    })
  })

  it('should make it syncroniously', async () => {
    var table = await Model.Table.create('public', 'test_table')

    assert.equal(table.table, 'test_table')

    var columnData = Model.Column({ name: 'some_column', type: 'integer', allow_null: false })

    var column = await table.addColumnObj(columnData);

    assert.deepEqual(column.attributes, {
      name: 'some_column',
      type: 'integer',
      default_value: undefined,
      max_length: undefined,
      allow_null: false
    })

    await table.drop();
  })
})