var sprintf = require("sprintf-js").sprintf;

global.Model.User = Model.base.extend({
  klassExtend: {

    findAll: function (callback) {

      var sql = $u.commentOf(function () {/*
        SELECT r.rolname, r.rolsuper, r.rolinherit,
          r.rolcreaterole, r.rolcreatedb, r.rolcanlogin,
          r.rolconnlimit, r.rolvaliduntil, r.rolreplication,
          ARRAY(SELECT b.rolname
                FROM pg_catalog.pg_auth_members m
                JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
                WHERE m.member = r.oid) as memberof,
          array_to_string(ARRAY(
            SELECT d.datname FROM pg_database d where d.datdba = r.oid
          ), ', ') as owned_dbs
        FROM pg_catalog.pg_roles r
        ORDER BY 1;
      */ });

      Model.base.q(sql, function(data, error) {
        callback(data.rows, error);
      });
    },

    // data: {username: ... password: ... superuser: ... }
    create: function (data, callback) {
      var sql = sprintf('CREATE USER "%s"', data.username);

      if (data.password) sql += sprintf(" WITH PASSWORD '%s'", data.password);
      sql += ';'
      if (data.superuser) sql += sprintf('ALTER USER "%s" WITH SUPERUSER;', data.username);

      Model.base.q(sql, function(data, error) {
        callback(data, error);
      });
    },

    drop: function (username, callback) {
      Model.base.q('DROP USER "%s"', username, callback);
    }
  }
});