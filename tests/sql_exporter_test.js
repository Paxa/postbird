require("../lib/pg_dump_runner")
var SqlExporter = require("../lib/sql_exporter")

describe('SqlExporter', () => {

  before(async () => {
    await testConnection();
  });

  after(async () => {
    await cleanupSchema();
  })

  it("dump sql to file or stdout", async () => {
    new PgDumpRunner();

    var table = await Model.Table.create('public', 'test_table')

    await table.insertRow([1])
    await table.insertRow([2])
    await table.insertRow([3])

    var exporter = new SqlExporter(null, {debug: true});

    var result = await new Promise((resolve, reject) => {
      exporter.doExport(getConnection(), (result, stdout, stderr) => {
        resolve({result, stdout, stderr});
      });
    });
    result = result.stdout.replace(/public\.test_table/g, 'test_table')

    assert.contain(result, "PostgreSQL database dump")
    assert.contain(result, "CREATE TABLE test_table")
    assert.contain(result, "COPY test_table (id) FROM stdin;")

    await table.drop()
  })

})
