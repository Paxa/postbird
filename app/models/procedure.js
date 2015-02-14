global.Model.Procedure = Model.base.extend({
  klassExtend: {
    findAll: function (callback) {
      var sql = $u.commentOf(function () {/*
        SELECT *, proname as name, ns.nspname, pg_authid.rolname as author,
               pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list
        FROM pg_proc
        INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
        INNER JOIN pg_authid ON (pg_proc.proowner = pg_authid.oid)
        INNER JOIN pg_language ON (pg_proc.prolang = pg_language.oid)
        WHERE ns.nspname = 'public' order by proname;
      */});

      Model.base.q(sql, function(data) {
        var procedures = [];
        data.rows.forEach(function (row) {
          procedures.push(new Model.Procedure('public', row));
        });
        callback(procedures);
      });
    }
  },

  init: function (schema, proc_data) {
    this.schema = schema;
    this.data = proc_data;
  }
});

!function () {
  var props = ['name', 'author', 'language', 'arg_list'];
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

