require('./test_helper');
var PgDumpRunner = require("../lib/pg_dump_runner");

describe("PgDumpRunner", () => {

  if (process.platform != 'linux') {
    it("should return absolute path to pg_dump", (done) => {
      var runner = new PgDumpRunner();

      node.fs.exists(runner.binaryPath(), (exists) => {
        assert(exists, true);
        done();
      })
    })
  }

  it("should add cmd arguments", () => {
    var runner = new PgDumpRunner();

    assert(runner.cmd_args, []);
    runner.addArguments('-v', '-d', '-a');

    assert(runner.cmd_args, ['-v', '-d', '-a']);
  })

  it("should run binary", (done) => {
    var runner = new PgDumpRunner();

    runner.execute(["--version"], (success, process, stdout) => {
      assert.match(stdout, /^pg_dump \(PostgreSQL\) /);
      assert(success);
      done();
    });
  })

  it("should run with promise", async () => {
    var runner = new PgDumpRunner();

    var result = await runner.execute(["--version"]);
    assert.match(result.stdout, /^pg_dump \(PostgreSQL\) /);
  })

});
