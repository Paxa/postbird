require "../../app/models/base"
require "../../app/models/procedure"

describe('Model.Procedure', do

  it("list user procedures", do |done|
    var sql = "CREATE FUNCTION my_inc(val integer) RETURNS integer AS $$" +
              "BEGIN RETURN val + 1; END; $$ LANGUAGE PLPGSQL;"

    Model.base.q(sql, do |sql_res, sql_err|
      Model.Procedure.findAll(do |procs|
        assert(procs.length, 1);
        assert(procs[0].schema, 'public');
        assert_true(procs[0] instanceof Model.Procedure);

        assert(procs[0].name, 'my_inc');
        assert(procs[0].language, 'plpgsql');
        assert(procs[0].arg_list, 'integer');
        assert(procs[0].is_aggregate, false);

        done()
      end)
    end)
  end)

end)