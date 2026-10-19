require('./test_helper');
require("../lib/psql_runner");

describe('PsqlRunner', () => {

  if (process.platform != 'linux') {
    it("should return absolute path to psql", (done) => {
      var runner = new PsqlRunner();

      node.fs.exists(runner.binaryPath(), (exists) => {
        assert.equal(exists, true);
        done();
      })
    })
  }

  it("should add cmd arguments", () => {
    var runner = new PsqlRunner();

    assert.deepEqual(runner.cmd_args, []);
    runner.addArguments('-v', '-d', '-a');

    assert.deepEqual(runner.cmd_args, ['-v', '-d', '-a']);
  })

  it("should run psql", (done) => {
    var runner = new PsqlRunner();

    assert.deepEqual(runner.cmd_args, []);

    runner.execute(["--version"], (success, process, stdout) => {
      assert.match(stdout, /^psql \(PostgreSQL\) /);
      assert.equal(success, true);
      done();
    });
  })

});
