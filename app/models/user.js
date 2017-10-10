var User = global.Model.User = Model.base.extend({

  init: function(username) {
    this.username = username;
  },

  klassExtend: {

    findAll: function (callback) {

      var sql = `
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
      `;

      Model.base.q(sql, (data, error) => {
        callback(data.rows, error);
      });
    },

    // data: {username: ... password: ... superuser: ... }
    create: function (data, callback) {
      var sql = `CREATE USER "${data.username}"`;

      if (data.password) sql += ` WITH PASSWORD '${data.password}'`;
      sql += ';'
      if (data.superuser) sql += `ALTER USER "${data.username}" WITH SUPERUSER;`;

      return Model.base.q(sql, (data, error) => {
        callback && callback(data, error);
      });
    },

    drop: function (username, callback) {
      Model.base.q('DROP USER "%s"', username, callback);
    }
  },

  // data: {username: ... password: ... superuser: ... }
  update: function (data, callback) {
    var sql = '';
    if (this.username != data.username) {
      sql += `alter user "${this.username}" RENAME TO ${data.username}; `;
    }
    if (data.password && data.password != '') {
      sql += `ALTER USER "${data.username}" WITH PASSWORD '${data.password}'; `;
    }
    if (data.superuser) {
      sql += `ALTER USER "${data.username}" WITH SUPERUSER; `;
    } else {
      sql += `ALTER USER "${data.username}" WITH NOSUPERUSER; `;
    }

    return Model.base.q(sql, (data, error) => {
      callback && callback(data, error);
    });
  },

  getGrants: function () {
    var sql = `
      SELECT
        coalesce(nullif(s[1], ''), 'PUBLIC') as grantee,
        relname as table_name,
        nspname as table_schema,
        string_agg(s[2], ', ') as privileges,
        relkind as table_type
      FROM
        pg_class c
        join pg_namespace n on n.oid = relnamespace
        join pg_roles r on r.oid = relowner,
        unnest(coalesce(relacl::text[], format('{%%s=arwdDxt/%%s}', rolname, rolname)::text[])) acl, 
        regexp_split_to_array(acl, '=|/') s
      WHERE (s[1] = '${this.username}' or s[1] is null) and nspname not in ('pg_catalog', 'information_schema', 'pg_toast')
      GROUP BY grantee, table_name, table_schema, relkind
      ORDER BY relkind != 'r', relkind != 'v', relkind != 'm', relkind != 'i', relkind, nspname, relname;
    `;

    return this.q(sql);
  }
});

module.exports = User;