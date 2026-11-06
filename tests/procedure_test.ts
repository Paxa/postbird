require('./test_helper');

describe('Model.Procedure', () => {

  before(async () => {
    await testConnection();
  });

  afterEach(async () => {
    await cleanupSchema();
  });

  it("list user procedures", async () => {
    var sql = "CREATE FUNCTION my_inc(val integer) RETURNS integer AS $$" +
              "BEGIN RETURN val + 1; END; $$ LANGUAGE PLPGSQL;"

    await ModelBase.q(sql)
    var procs = await Model.Procedure.findAll();

    assert.equal(procs.length, 1)
    assert.equal(procs[0].schema, 'public')
    assert(procs[0] instanceof Model.Procedure)

    assert.equal(procs[0].name, 'my_inc')
    assert.equal(procs[0].language, 'plpgsql')
    assert.equal(procs[0].arg_list, 'integer')
    assert.equal(procs[0].return_type, 'int4')
    assert.equal(procs[0].is_aggregate, false)

    await procs[0].drop()
  })

  it("Create function", async () => {
    var pg_proc: any = await Model.Procedure.createFunction("my_inc2", "val integer", "integer", "RETURN val + 1")

    assert.equal(pg_proc.name, "my_inc2")
    assert.equal(pg_proc.language, 'plpgsql')
    assert.equal(pg_proc.arg_list, 'integer')
    assert.equal(pg_proc.return_type, 'int4')
    assert.equal(pg_proc.is_aggregate, false)

    await pg_proc.drop()
  });

  it("Create function fail", async () => {
    getConnection().printTestingError = false;
    var pg_proc: any = await Model.Procedure.createFunction("my_inc2", "val integer", "integer", "RETURN_ val + 1");
    getConnection().printTestingError = true;

    assert.ok(pg_proc.error)
    assert.equal(pg_proc.name, "my_inc2")
    assert.equal(pg_proc.language, 'plpgsql')
    assert.equal(pg_proc.return_type, 'integer')
    assert.equal(pg_proc.is_aggregate, false)

    var searchable = await Model.Procedure.find('my_inc2')

    assert.equal(searchable, undefined)
  });

  it("Find procedure", async () => {
    await Model.Procedure.createFunction("new_proc", "val integer", "integer", "RETURN val + 1")

    var searchable = await Model.Procedure.find('my_inc2')
    assert.equal(searchable, undefined)

    var pg_proc: any = await Model.Procedure.find('new_proc')
    assert.ok(pg_proc)
    assert.equal(pg_proc.name, 'new_proc')

    await pg_proc.drop()
  })

  it("Drop procedure", async () => {
    var sql = "CREATE FUNCTION my_inc3(val integer) RETURNS integer AS $$" +
              "BEGIN RETURN val + 1; END; $$ LANGUAGE PLPGSQL;"
    await ModelBase.q(sql)

    var procs = await Model.Procedure.findAll()

    assert.equal(procs.length, 1)
    assert.equal(procs[0].name, 'my_inc3')

    await procs[0].drop()

    var procs2 = await Model.Procedure.findAll()
    assert.equal(procs2.length, 0)
  })

  it("listLanguages returns available PostgreSQL procedural languages", async () => {
    var languages = await Model.Procedure.listLanguages();
    assert.ok(Array.isArray(languages));
    var names = languages.map((l: any) => l.lanname);
    assert.contain(names, 'plpgsql');
    assert.contain(names, 'sql');
  })

  it("getDefinition returns procedure source code definition", async () => {
    var sql = "CREATE OR REPLACE FUNCTION test_def_fn(x integer) RETURNS integer AS $$ " +
              "BEGIN RETURN x * 2; END; $$ LANGUAGE plpgsql;";
    await ModelBase.q(sql);

    var proc: any = await Model.Procedure.find('test_def_fn');
    assert.ok(proc);

    var def: any = await proc.getDefinition();
    assert.ok(def);
    assert.equal(def.proname, 'test_def_fn');
    assert.contain(def.source, 'RETURN x * 2');

    await proc.drop();
  })

  it("findAllWithExtensions returns procedures including extension metadata", async () => {
    var procsWithExt = await Model.Procedure.findAllWithExtensions();
    assert.ok(Array.isArray(procsWithExt));
  })

})