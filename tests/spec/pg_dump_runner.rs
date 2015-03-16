require "../../lib/pg_dump_runner"

describe('PgDumpRunner', do

  it("should return absolute path to pg_dump", do |done|
    var runner = new PgDumpRunner();

    node.fs.exists(runner.binaryPath(), do |exists|
      assert(exists, true);
      done();
    end)
  end)

  it("should add cmd arguments", do
    var runner = new PgDumpRunner();

    assert(runner.cmd_args, []);
    runner.addArguments('-v', '-d', '-a');

    assert(runner.cmd_args, ['-v', '-d', '-a']);
  end)

  it("should run binary", do |done|
    var runner = new PgDumpRunner();

    runner.execute(["--version"], do |success, process, stdout|
      assert(stdout, "pg_dump (PostgreSQL) 9.4.0\n");
      assert(success, true);
      done();
    end);
  end)

end)
