global.Model.Table = Model.base.extend({
  init: function (schema, table_name) {
    this.schema = schema;
    this.table = table_name;
  },

  rename: function (new_name, callback) {
    this.q(sql = "ALTER INDEX %s RENAME TO  %s", this.table, new_name, callback);
  },

  remove: function(callback) {
    this.q("DROP TABLE %s", this.table, callback);
  },

  getStructure: function (callback) {
    var sql = "select * from information_schema.columns where table_schema = '%s' and table_name = '%s';"
    this.q(sql, this.schema, this.table, function(data) {
      this.getPrimaryKey(function(rows, error) {
        if (!error) {
          var keys = rows.map(function(r) {
            return r.attname;
          });

          data.rows.forEach(function(row) {
            row.is_primary_key = keys.indexOf(row.column_name) != -1;
          });
        }
        callback(data.rows);
      });
    }.bind(this));
  },

  getPrimaryKey: function (callback) {
    var sql = "SELECT pg_attribute.attname \
    FROM pg_index, pg_class, pg_attribute \
    WHERE \
      pg_class.oid = '%s'::regclass AND \
      indrelid = pg_class.oid AND \
      pg_attribute.attrelid = pg_class.oid AND \
      pg_attribute.attnum = any(pg_index.indkey) \
      AND indisprimary;";
    this.q(sql, this.table, function(data, error) {
      callback((data || {}).rows, error);
    });
  },

  // ALTER TABLE mytable ADD COLUMN mycolumn character varying(50) NOT NULL DEFAULT 'foo';
  // TODO: Somewhere here is wrong
  addColumn: function (name, type, max_length, default_value, is_null, callback) {
    var type_with_length = max_length ? type + "(" + max_length + ")" : type;
    var null_sql = is_null ? "NULL" : "NOT NULL";
    var default_sql = default_value === undefined ? '' : 'DEFAULT ' + JSON.stringify(default_value);
    sql = "ALTER TABLE %s ADD %s %s %s %s;"
    this.q(sql, this.table, name, type_with_length, default_sql, null_sql, function(data, error) {
      callback();
    });
  },
});

Model.Table.create = function create (tableName, schema, callback) {
                           Arg.assert('string', 'string', 'function');

  sql = "CREATE TABLE %s (id SERIAL PRIMARY KEY)";
  if (schema != '' && schema != 'public') {
    sql += sprintf(" TABLESPACE %s", schema);
  }

  console.log(sql, tableName);
  Model.base.q(sql, tableName, callback);
};

Model.Table.l = function (schema, table_name) {
  return new Model.Table(schema, table_name);
};