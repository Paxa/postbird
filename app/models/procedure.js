global.Model.Procedure = Model.base.extend({
  klassExtend: {
    findAll: function (callback) {
      var sql = $u.commentOf(function () {/*
        SELECT *, proname as name, ns.nspname schema_name, pg_authid.rolname as author,
               pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list,
               ret_type.typname as return_type
        FROM pg_proc
        INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
        INNER JOIN pg_authid ON (pg_proc.proowner = pg_authid.oid)
        INNER JOIN pg_language ON (pg_proc.prolang = pg_language.oid)
        INNER JOIN pg_type ret_type ON (pg_proc.prorettype = ret_type.oid)
        WHERE ns.nspname = 'public' order by proname;
      */});

      Model.base.q(sql, function(data, error) {
        if (error) {
          callback([]);
          return;
        }
        var procedures = [];
        data.rows.forEach(function (row) {
          procedures.push(new Model.Procedure('public', row));
        });
        callback(procedures);
      });
    },

    find: function (name, callback) {
      var sql = $u.commentOf(function () {/*
        SELECT *, proname as name, ns.nspname schema_name, pg_authid.rolname as author,
               pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list,
              ret_type.typname as return_type
        FROM pg_proc
        INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
        INNER JOIN pg_authid ON (pg_proc.proowner = pg_authid.oid)
        INNER JOIN pg_language ON (pg_proc.prolang = pg_language.oid)
        INNER JOIN pg_type ret_type ON (pg_proc.prorettype = ret_type.oid)
        WHERE ns.nspname = 'public' AND proname = '%s' order by proname;
      */});

      Model.base.q(sql, name, function(data, error) {
        if (error) {
          callback();
          return;
        }
        if (data.rows[0]) {
          callback( Model.Procedure('public', data.rows[0]) );
        } else {
          callback();
        }
      });
    },

    // createFunction('my_inc1', 'integer val', 'integer', 'return val + 1;');
    createFunction: function (name, args, return_type, body, options, callback) {
      if (typeof callback == 'undefined' && typeof options == 'function') {
        callback = options;
        options = {};
      }
      options.lang = options.lang || 'plpgsql';

      var sql = "CREATE FUNCTION %s(%s) RETURNS %s AS $$ BEGIN %s; END; $$ LANGUAGE %s";

      //var fiber = global.Fiber && global.Fiber.current;

      Model.base.q(sql, name, args, return_type, body, options.lang, function (data, error) {
        //if (error && fiber) throw error;

        if (!error) {
          this.find(name, callback);
        } else {
          var obj = Model.Procedure('public', {
            name: name,
            language: options.lang,
            arg_list: args,
            return_type: return_type,
            proisagg: false
          });
          obj.error = error;
          callback(obj);
        }
      }.bind(this));
    },

    listLanguages: function (callback) {
      Model.base.q("select * from pg_language", function (data, error) {
        callback(data.rows);
      });
    }
  },

  init: function (schema, proc_data) {
    this.schema = schema;
    this.data = proc_data;
  },

  drop: function (callback) {
    var type = this.is_aggregate ? "AGGREGATE" : "FUNCTION";
    var sql = "drop %s %s.%s(%s)";

    var fiber = global.Fiber && global.Fiber.current;

    this.q(sql, type, this.data.schema_name, this.name, this.arg_list, function (result, error) {
      if (error && fiber) {
        throw error;
      }
      callback(result, error);
    });
  },
});

!function () {
  var props = ['name', 'author', 'language', 'arg_list', 'return_type'];
  props.forEach(function (prop) {
    Object.defineProperty(Model.Procedure.prototype, prop, {
      get: function () {
        return this.data[prop];
      }
    });
  });

  Object.defineProperty(Model.Procedure.prototype, 'is_aggregate', {
    get: function () {
      return this.data.proisagg;
    }
  });

}();

