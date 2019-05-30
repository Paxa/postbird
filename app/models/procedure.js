class Procedure extends ModelBase {

  /*::
  name: string
  error: string
  schema: string
  oid: string
  is_aggregate: boolean
  arg_list: string
  language: string
  */

  static findAll () {
    var sql = `
      SELECT pg_proc.oid, *, proname as name, ns.nspname schema_name, pg_authid.rolname as author,
             pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list,
             ret_type.typname as return_type
      FROM pg_proc
      INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
      INNER JOIN pg_authid ON (pg_proc.proowner = pg_authid.oid)
      INNER JOIN pg_language ON (pg_proc.prolang = pg_language.oid)
      INNER JOIN pg_type ret_type ON (pg_proc.prorettype = ret_type.oid)
      WHERE ns.nspname = 'public'
      ORDER BY proname;
    `;

    return this.q(sql).then(data => {
      var procedures = [];
      data.rows.forEach((row) => {
        procedures.push(new Model.Procedure('public', row));
      });
      return Promise.resolve(procedures);
    });
  }

  static find (name) {
    var sql = `
      SELECT pg_proc.oid, *, proname as name, ns.nspname schema_name, pg_authid.rolname as author,
             pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list,
             ret_type.typname as return_type, pg_get_functiondef(pg_proc.oid) as full_prosrc
      FROM pg_proc
      INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
      INNER JOIN pg_authid ON (pg_proc.proowner = pg_authid.oid)
      INNER JOIN pg_language ON (pg_proc.prolang = pg_language.oid)
      INNER JOIN pg_type ret_type ON (pg_proc.prorettype = ret_type.oid)
      WHERE ns.nspname = 'public' AND proname = '${name}' ${name.match(/^\d+$/) ? `OR pg_proc.oid = '${name}'` : ''}
      ORDER BY proname;
    `;

    return this.q(sql).then(data => {
      if (data.rows[0]) {
        var proc = new Model.Procedure('public', data.rows[0]);
        return Promise.resolve(proc);
      }
    });
  }

  // createFunction('my_inc1', 'integer val', 'integer', 'return val + 1;');
  static createFunction (name, args, return_type, body, options) {
    if (!options) options = {};
    options.lang = options.lang || 'plpgsql';

    var sql = "CREATE FUNCTION %s(%s) RETURNS %s AS $$ BEGIN %s; END; $$ LANGUAGE %s";

    return new Promise((resolve, reject) => {
      this.q(sql, name, args, return_type, body, options.lang).then(data => {
        resolve(this.find(name));
      }).catch(error => {
        var obj = new Model.Procedure('public', {
          name: name,
          language: options.lang,
          arg_list: args,
          return_type: return_type,
          proisagg: false
        });
        obj.error = error;
        resolve(obj);
      });
    });
  }

  static listLanguages () {
    return this.q("SELECT * FROM pg_language").then(data => {
      return Promise.resolve(data.rows);
    });
  }

  static findAllWithExtensions () {
    var sql = `SELECT
          p.oid, p.*,
          proname as name, pg_namespace.nspname as schema_name, pg_authid.rolname as author,
          pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list,
          ret_type.typname as return_type, e.extname as extension
      FROM pg_proc p
      JOIN pg_namespace ON pg_namespace.oid = p.pronamespace
      LEFT JOIN pg_language ON pg_language.oid = p.prolang
      LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e' AND d.objid IS not NULL
      INNER JOIN pg_authid ON (p.proowner = pg_authid.oid)
      INNER JOIN pg_type ret_type ON (p.prorettype = ret_type.oid)
      LEFT JOIN pg_extension e on refobjid = e.oid
      WHERE pg_namespace.nspname = 'public' OR refobjid != 0
      ORDER BY p.proname, arg_list`;

    return this.q(sql).then(data => {
      var procedures = [];
      data.rows.forEach((row) => {
        procedures.push(new Model.Procedure('public', row));
      });
      return Promise.resolve(procedures);
    });
  }

  static async update (oldProcId, source) {
    var proc = await this.find(oldProcId);
    proc.drop();
    return this.q(source);
  }

  constructor (schema, proc_data) {
    super();
    this.schema = schema;
    this.data = proc_data;
  }

  getDefinition () {
    var sql = "SELECT proname, pg_get_functiondef(oid) AS source FROM pg_proc WHERE oid = '%s'";

    return this.q(sql, this.oid).then((result) => {
      return Promise.resolve(result.rows[0]);
    });
  }

  drop (callback) {
    var type = this.is_aggregate ? "AGGREGATE" : "FUNCTION";
    var sql = "DROP %s %s.%s(%s)";

    return this.q(sql, type, this.data.schema_name, this.name, this.arg_list, (result, error) => {
      callback && callback(result, error);
    });
  }
}

!function () {
  var props = ['oid', 'name', 'author', 'language', 'arg_list', 'return_type', 'prosrc', 'extension', 'full_prosrc'];
  props.forEach((prop) => {
    Object.defineProperty(Procedure.prototype, prop, {
      get () {
        return this.data[prop];
      }
    });
  });

  Object.defineProperty(Procedure.prototype, 'is_aggregate', {
    get () {
      return this.data.proisagg;
    }
  });

  Object.defineProperty(Procedure.prototype, 'source', {
    get () {
      return this.data.prosrc;
    }
  });

}();

/*::
declare var Procedure__: typeof Procedure
*/

module.exports = Procedure;
