var sprintf = require("sprintf-js").sprintf;

global.Model.Schema = Model.base.extend({
  className: 'Model.Schema',

  init: function (schemaName) {
    this.schemaName = schemaName;
  },

  drop: function (options, callback) {
    if (callback === undefined && typeof options !== 'object') {
      callback = options;
      options = {};
    }

    if (options.ifExist === undefined) options.ifExist = true;
    if (options.cascade === undefined) options.cascade = true;

    var ifExistSql = options.ifExist ? "IF EXISTS" : "";
    var cascadeSql = options.cascade ? "CASCADE" : "";
    var sql = `DROP SCHEMA ${ifExistSql} "${this.schemaName}" ${cascadeSql}`;

    this.q(sql, function (res, error) {
      callback(res, error);
    });
  },

  getTableNames: function (callback) {
    var sql = `SELECT * FROM information_schema.tables where table_schema = '${this.schemaName}';`;

    this.query(sql, function(rows, error) {
      var names = [];
      if (rows.rows) {
        names = rows.rows.map(function (t) { return t.table_name });
      }
      callback(names, error);
    });
  }

});

global.Model.Schema.create = function (name, options, callback) {
  if (callback === undefined && typeof options == 'function') {
    callback = options;
    options = {};
  }

  var sql = 'CREATE SCHEMA "%s";';

  Model.base.q(sql, name, function (res, error) {
    callback(Model.Schema(name), error);
  });
};

global.Model.Schema.findAll = function (callback) {
  var sql = "select nspname as name from pg_catalog.pg_namespace;"

  Model.base.q(sql, function (res, error) {
    var schemas = [];
    if (res) {
      res.rows.forEach(function (row) {
        schemas.push(Model.Schema(row.name));
      });
    }
    callback(schemas, error);
  });
};

