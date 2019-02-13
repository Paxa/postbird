class User extends ModelBase {

  /*::
  username: string
  */

  constructor(username) {
    super();
    this.username = username;
  }

  static findAll () {
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

    return this.q(sql).then(result => {
      return Promise.resolve(result.rows);
    });
  }

  // data: {username: ... password: ... superuser: ... }
  static create (data) {
    if (!data.username) {
      throw new Error('username is required');
    }
    var sql = `CREATE USER "${data.username}"`;

    if (data.password) sql += ` WITH PASSWORD '${data.password}'`;
    sql += ';'
    if (data.superuser) sql += `ALTER USER "${data.username}" WITH SUPERUSER;`;

    return this.q(sql).then(result => {
      return Promise.resolve(new User(data.username));
    });
  }

  static drop (username, options = {} /*:: as any */) {
    var sql = `DROP USER ${options.ifExists ? 'IF EXISTS' : ''} "${username}"`;
    return this.q(sql);
  }

  // data: {username: ... password: ... superuser: ... }
  update (data) {
    var sql = '';
    if (this.username != data.username) {
      sql += `ALTER USER "${this.username}" RENAME TO "${data.username}"; `;
    }
    if (data.password && data.password != '') {
      sql += `ALTER USER "${data.username}" WITH PASSWORD '${data.password}'; `;
    }
    if (data.superuser) {
      sql += `ALTER USER "${data.username}" WITH SUPERUSER; `;
    } else {
      sql += `ALTER USER "${data.username}" WITH NOSUPERUSER; `;
    }

    return this.q(sql);
  }

  getGrants () {
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
}


/*::
declare var User__: typeof User
*/

module.exports = User;