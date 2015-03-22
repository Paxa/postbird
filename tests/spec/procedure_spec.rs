require "../../app/models/base"
require "../../app/models/procedure"

describe('Model.Procedure', do

  sync_it("list user procedures", do
    var sql = "CREATE FUNCTION my_inc(val integer) RETURNS integer AS $$" +
              "BEGIN RETURN val + 1; END; $$ LANGUAGE PLPGSQL;"

    Model.base.q(sql)
    var procs = Model.Procedure.findAll()

    assert(procs.length, 1)
    assert(procs[0].schema, 'public')
    assert_true(procs[0] instanceof Model.Procedure)

    assert(procs[0].name, 'my_inc')
    assert(procs[0].language, 'plpgsql')
    assert(procs[0].arg_list, 'integer')
    assert(procs[0].return_type, 'int4')
    assert(procs[0].is_aggregate, false)

    procs[0].drop()
  end)

  sync_it("Create function", do
    var pg_proc = Model.Procedure.createFunction("my_inc2", "val integer", "integer", "RETURN val + 1")

    assert(pg_proc.name, "my_inc2")
    assert(pg_proc.language, 'plpgsql')
    assert(pg_proc.arg_list, 'integer')
    assert(pg_proc.return_type, 'int4')
    assert(pg_proc.is_aggregate, false)

    pg_proc.drop()
  end);

  sync_it("Create function fail", do
    connection.printTestingError = false;
    var pg_proc = Model.Procedure.createFunction("my_inc2", "val integer", "integer", "RETURN_ val + 1")
    connection.printTestingError = true;

    assert_present(pg_proc.error)
    assert(pg_proc.name, "my_inc2")
    assert(pg_proc.language, 'plpgsql')
    assert(pg_proc.return_type, 'integer')
    assert(pg_proc.is_aggregate, false)

    var searchable = Model.Procedure.find('my_inc2')

    assert(searchable, undefined)
  end);

  sync_it("Find procedure", do
    Model.Procedure.createFunction("new_proc", "val integer", "integer", "RETURN val + 1")

    var searchable = Model.Procedure.find('my_inc2')
    assert(searchable, undefined)

    pg_proc = Model.Procedure.find('new_proc')
    assert_present(pg_proc)
    assert(pg_proc.name, 'new_proc')

    pg_proc.drop()
  end)

  sync_it("Drop procedure", do
    var sql = "CREATE FUNCTION my_inc3(val integer) RETURNS integer AS $$" +
              "BEGIN RETURN val + 1; END; $$ LANGUAGE PLPGSQL;"
    Model.base.q(sql)

    var procs = Model.Procedure.findAll()

    assert(procs.length, 1)
    assert(procs[0].name, 'my_inc3')

    procs[0].drop()

    procs2 = Model.Procedure.findAll()
    assert(procs2.length, 0)
  end)

end)