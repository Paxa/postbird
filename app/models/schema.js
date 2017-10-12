class Schema extends Model.base {

  constructor (schemaName) {
    super();
    this.className = 'Model.Schema';
    this.schemaName = schemaName;
  }

  static create (name, options, callback) {
    if (callback === undefined && typeof options == 'function') {
      callback = options;
      options = {};
    }

    var sql = 'CREATE SCHEMA "${name}";';

    return this.query(sql, (res, error) => {
      callback && callback(Model.Schema(name), error);
    });
  }

  static findAll (callback) {
    var sql = "select nspname as name from pg_catalog.pg_namespace;"

    return this.query(sql, (res, error) => {
      var schemas = [];
      if (res) {
        res.rows.forEach((row) => {
          schemas.push(Model.Schema(row.name));
        });
      }
      callback(schemas, error);
    });
  }

  drop (options, callback) {
    if (callback === undefined && typeof options !== 'object') {
      callback = options;
      options = {};
    }

    if (options.ifExist === undefined) options.ifExist = true;
    if (options.cascade === undefined) options.cascade = true;

    var ifExistSql = options.ifExist ? "IF EXISTS" : "";
    var cascadeSql = options.cascade ? "CASCADE" : "";
    var sql = `DROP SCHEMA ${ifExistSql} "${this.schemaName}" ${cascadeSql}`;

    return this.q(sql, (res, error) => {
      callback && callback(res, error);
    });
  }

  getTableNames (callback) {
    var sql = `SELECT * FROM information_schema.tables where table_schema = '${this.schemaName}';`;

    return this.query(sql, (rows, error) => {
      var names = [];
      if (rows.rows) {
        names = rows.rows.map((t) => { return t.table_name });
      }
      callback && callback(names, error);
    });
  }
}

global.Model.Schema = Schema;

module.exports = Schema;
