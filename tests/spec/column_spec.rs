require "../../app/models/base"
require "../../app/models/table"
require "../../app/models/column"


describe('Model.Column', do
  //@timeout(50000)

  it('should make virtual attributes', do
    var column = Model.Column({
      name: 'some_column',
      type: 'integer',
      default_value: 0,
      max_length: 5,
      allow_null: true
    })

    assert(column.data.column_name, 'some_column')
    assert(column.data.data_type, 'integer')
    assert(column.data.column_default, 0)
    assert(column.data.character_maximum_length, 5)
    assert(column.data.is_nullable, 'YES')
  end)

  it('table.addColumnObj should return column object', do |done|
    Model.Table.create('public', 'test_table', do |table, res, error|
      var column = Model.Column({
        name: 'some_column',
        type: 'integer',
        default_value: 0,
        allow_null: true
      })

      table.addColumnObj(column, do |column|
        table.getColumnNames(do |names|
          assert(names, ['id', 'some_column'])
          table.drop(done)
        end)
      end)
    end)
  end)

  it('table.addColumnObj should return correct column object', do |done|
    Model.Table.create('public', 'test_table', do |table, res, error|
      var column = Model.Column({ name: 'some_column', type: 'integer' })
      table.addColumnObj(column, do |column|
        table.getColumnObj(column.name, do |other_column|

          // table deference
          assert(other_column.table, table)

          // attributes
          assert(other_column.name,           column.name)
          assert(other_column.type,           column.type)
          assert(other_column.allow_null,     column.allow_null)
          // TODO: Make sure it always null or always undefined
          //assert(other_column.default_value,  column.default_value)

          table.drop(done)
        end);
      end)
    end)
  end)

  it('column.drop should remove column', do |done|
    Model.Table.create('public', 'test_table', do |table, res, error|
      var column = Model.Column({ name: 'some_column', type: 'integer' })
      table.addColumnObj(column, do |column|
        column.drop(do
          table.getColumnNames(do |names|
            assert(names, ['id'])
            table.drop(done)
          end)
        end)
      end)
    end)
  end)

  it('should update column attributes', do |done|
    Model.Table.create('public', 'test_table', do |table, res, error|
      var column = Model.Column({ name: 'some_column', type: 'integer', allow_null: false })
      table.addColumnObj(column, do |column|
        column.name = 'some_column2'
        column.allow_null = true
        column.type = 'character varying'
        column.default_value = "Foo"
        column.max_length = 30
        assert(column.changes, {
          name: ["some_column", "some_column2"],
          allow_null: [false, true],
          type: ["integer", "character varying"],
          default_value: [null, "Foo"],
          max_length: [null, 30]
        })
        column.save(do
          table.getColumnNames(do |names|
            assert(names, ['id', 'some_column2'])
            table.getColumnObj('some_column2', do |column2|
              assert(column2.type, 'character varying')
              assert(column2.max_length, 30)
              // here is little magic with default value, it comes with type in postgres
              assert(column2.default_value, "'Foo'::character varying")
              assert(column2.allow_null, true)
              table.drop(done)
            end)
          end)
        end)
      end)
    end)
  end)

  it('should have getter "attributes"', do |done|
    Model.Table.create('public', 'test_table', do |table, res, error|
      var column = Model.Column({ name: 'some_column', type: 'integer', allow_null: false })
      table.addColumnObj(column, do |column|
        assert(column.attributes, {
          name: 'some_column',
          type: 'integer',
          allow_null: false
        })
        table.drop(done)
      end)
    end)
  end)
end)