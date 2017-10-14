class Procedure extends Model.base {

  static findAll (callback) {
    var sql = `
      SELECT pg_proc.oid, *, proname as name, ns.nspname schema_name, pg_authid.rolname as author,
             pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list,
             ret_type.typname as return_type
      FROM pg_proc
      INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
      INNER JOIN pg_authid ON (pg_proc.proowner = pg_authid.oid)
      INNER JOIN pg_language ON (pg_proc.prolang = pg_language.oid)
      INNER JOIN pg_type ret_type ON (pg_proc.prorettype = ret_type.oid)
      WHERE ns.nspname = 'public' order by proname;
    `;

    return Model.base.q(sql).then(data => {
      var procedures = [];
      data.rows.forEach((row) => {
        procedures.push(new Model.Procedure('public', row));
      });
      callback && callback(procedures);
      return Promise.resolve(procedures);
    });
  }

  static find (name, callback) {
    var sql = `
      SELECT pg_proc.oid, *, proname as name, ns.nspname schema_name, pg_authid.rolname as author,
             pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list,
            ret_type.typname as return_type
      FROM pg_proc
      INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
      INNER JOIN pg_authid ON (pg_proc.proowner = pg_authid.oid)
      INNER JOIN pg_language ON (pg_proc.prolang = pg_language.oid)
      INNER JOIN pg_type ret_type ON (pg_proc.prorettype = ret_type.oid)
      WHERE ns.nspname = 'public' AND proname = '${name}' ${name.match(/^\d+$/) ? `OR pg_proc.oid = '${name}'` : ''} order by proname;
    `;

    return Model.base.q(sql).then(data => {
      if (data.rows[0]) {
        var proc = new Model.Procedure('public', data.rows[0]);
        callback && callback(proc);
        return Promise.resolve(proc);
      } else {
        callback && callback();
      }
    });
  }

  // createFunction('my_inc1', 'integer val', 'integer', 'return val + 1;');
  static createFunction (name, args, return_type, body, options, callback) {
    if (typeof callback == 'undefined' && typeof options == 'function') {
      callback = options;
      options = {};
    }
    if (!options) options = {};
    options.lang = options.lang || 'plpgsql';

    var sql = "CREATE FUNCTION %s(%s) RETURNS %s AS $$ BEGIN %s; END; $$ LANGUAGE %s";

    return new Promise((resolve, reject) => {
      Model.base.q(sql, name, args, return_type, body, options.lang, (data, error) => {
        try {
          if (!error) {
            resolve(this.find(name, callback));
          } else {
            var obj = new Model.Procedure('public', {
              name: name,
              language: options.lang,
              arg_list: args,
              return_type: return_type,
              proisagg: false
            });
            obj.error = error;
            callback && callback(obj);
            resolve(obj);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  static listLanguages (callback) {
    Model.base.q("select * from pg_language", (data, error) => {
      callback(data.rows);
    });
  }

  static findAllWithExtensions (callback) {
    var sql = `SELECT
          p.oid, p.*,
          proname as name, pg_namespace.nspname as schema_name, pg_authid.rolname as author,
          pg_language.lanname as language, oidvectortypes(proargtypes) as arg_list,
          ret_type.typname as return_type, e.extname as extension
      FROM pg_proc p
      JOIN pg_namespace ON pg_namespace.oid = p.pronamespace
      left JOIN pg_language ON pg_language.oid = p.prolang
      LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e' AND d.objid IS not NULL
      INNER JOIN pg_authid ON (p.proowner = pg_authid.oid)
      INNER JOIN pg_type ret_type ON (p.prorettype = ret_type.oid)
      left join pg_extension e on refobjid = e.oid
      where pg_namespace.nspname = 'public' or refobjid != 0
      order by p.proname, arg_list`;

    Model.base.q(sql, (data, error) => {
      if (error) {
        callback([]);
        return;
      }
      var procedures = [];
      data.rows.forEach((row) => {
        procedures.push(new Model.Procedure('public', row));
      });
      callback(procedures);
    });
  }

  constructor (schema, proc_data) {
    super();
    this.schema = schema;
    this.data = proc_data;
  }

  getDefinition (callback) {
    var sql = "select proname, pg_get_functiondef(oid) as source from pg_proc where oid = '%s'";

    this.q(sql, this.oid, (result, error) => {
      if (error) {
        throw error;
      }
      callback && callback(result && result.rows[0], error);
    });
  }

  drop (callback) {
    var type = this.is_aggregate ? "AGGREGATE" : "FUNCTION";
    var sql = "drop %s %s.%s(%s)";

    return this.q(sql, type, this.data.schema_name, this.name, this.arg_list, (result, error) => {
      callback && callback(result, error);
    });
  }
};

!function () {
  var props = ['oid', 'name', 'author', 'language', 'arg_list', 'return_type', 'prosrc', 'extension'];
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

module.exports = Procedure;
