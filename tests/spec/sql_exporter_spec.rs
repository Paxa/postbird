require "../../lib/pg_dump_runner"
require "../../lib/sql_exporter"

describe('SqlExporter', do

  sync_it("dump sql to file or stdout", do
    var runner = new PgDumpRunner();

    var table = Model.Table.create('public', 'test_table')
    table.addColumnObj(Model.Column('some_column', {type: 'integer'}));

    table.insertRow([1])
    table.insertRow([2])
    table.insertRow([3])

    var exporter = new SqlExporter(null, {debug: false});

    var result = exporter.doExport(global.connection)

    assert_contain(result, "PostgreSQL database dump")
    assert_contain(result, "CREATE TABLE test_table")
    assert_contain(result, "COPY test_table (id) FROM stdin;")

    //process.stdout.write(result)

    table.drop()
  end)

end)