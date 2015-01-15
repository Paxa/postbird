require "../../lib/psql_runner"

describe('PsqlRunner', do

  it("should return absolute path to psql", do |done|
    var runner = new PsqlRunner();

    node.fs.exists(runner.psqlPath(), do |exists|
      assert(exists, true);
      done();
    end)
  end)

  it("should add cmd arguments", do
    var runner = new PsqlRunner();

    assert(runner.cmd_args, []);
    runner.addArguments('-v', '-d', '-a');

    assert(runner.cmd_args, ['-v', '-d', '-a']);
  end)

  it("should run psql", do |done|
    var runner = new PsqlRunner();

    assert(runner.cmd_args, []);

    runner.execute(["--version"], do |success, process, stdout|
      assert(stdout, "psql (PostgreSQL) 9.4.0\n");
      assert(success, true);
      done();
    end);
  end)

end)
