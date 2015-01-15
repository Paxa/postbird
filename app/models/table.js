var sprintf = require("sprintf-js").sprintf;

global.Model.Table = Model.base.extend({
  init: function (schema, table_name) {
    this.schema = schema;
    this.table = table_name;
  },

  rename: function (new_name, callback) {
    this.q(sql = "ALTER INDEX %s RENAME TO  %s", this.table, new_name, function(data, error) {
      this.table = new_name;
      callback(error);
    }.bind(this));
  },

  remove: function(callback) {
    this.q("DROP TABLE \"%s\"", this.table, callback);
  },

  drop: function (callback) {
    this.remove(callback);
  },

  safeDrop: function (callback) {
    this.q('DROP TABLE IF EXISTS "%s" CASCADE', this.table, callback);
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

  getColumnTypes: function (callback) {
    var sql = "select * from information_schema.columns where table_schema = '%s' and table_name = '%s';"
    this.q(sql, this.schema, this.table, function(data) {
      var types = {};
      data.rows.forEach(function(row) {
        types[row.column_name] = row;
        types[row.column_name].real_format = row.udt_name;
      });
      callback(types);
    });
  },

  getColumns: function (name, callback) {
    if (callback == undefined) {
      callback = name;
      name = undefined;
    }

    var sql = "select * from information_schema.columns where table_schema = '%s' and table_name = '%s' %s;"
    var cond = name ? " and column_name = '" + name + "'" : '';
    this.q(sql, this.schema, this.table, cond, function(rows) {
      callback(rows.rows);
    });
  },

  getColumnNames: function (callback) {
    this.getColumns(function (rows) {
      var names = [];
      rows.forEach(function(c) { names.push(c.column_name); });
      callback(names);
    });
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
    var default_sql = this.default_sql(default_value);
    sql = "ALTER TABLE %s ADD %s %s %s %s;"
    this.q(sql, this.table, name, type_with_length, default_sql, null_sql, function(data, error) {
      callback();
    });
  },

  getColumnObj: function (name, callback) {
    this.getColumns(name, function(data) {
      var row = new Model.Column(data[0].column_name, data[0]);
      row.table = this;
      callback(row);
    }.bind(this));
  },

  addColumnObj: function (columnObj, callback) {
    this.addColumn(columnObj.name, columnObj.type, columnObj.max_length, columnObj.default_value, columnObj.allow_null, function() {
      columnObj.table = this;
      callback(columnObj);
    }.bind(this));
  },

  addIndex: function (name, uniq, columns, callback) {
    var sql = "CREATE %s INDEX %s ON %s(%s);"
    var uniq_sql = uniq ? 'UNIQUE' : '';
    var columns_sql = columns.join(', ');
    this.q(sql, uniq_sql, name, this.table, columns_sql, function(data, error) {
      callback();
    });
  },

  default_sql: function (default_value) {
    if (default_value !== undefined && default_value !== '') {
      return 'DEFAULT ' + JSON.stringify(default_value).replace(/^"/, "'").replace(/"$/, "'")
    } else {
      return '';
    }
  },

  // find indexes
  describe: function (callback) {
    var sql_find_oid = (function () { /*
      SELECT c.oid,
        n.nspname,
        c.relname
      FROM pg_catalog.pg_class c
           LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname ~ '^(%s)$'
--        AND pg_catalog.pg_table_is_visible(c.oid)
      ORDER BY 2, 3
    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    var sql_find_types = (function () { /*
      SELECT a.attname,
        pg_catalog.format_type(a.atttypid, a.atttypmod),
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef),
        a.attnotnull, a.attnum,
        (SELECT c.collname FROM pg_catalog.pg_collation c, pg_catalog.pg_type t
         WHERE c.oid = a.attcollation AND t.oid = a.atttypid AND a.attcollation <> t.typcollation) AS attcollation,
        NULL AS indexdef,
        NULL AS attfdwoptions
      FROM pg_catalog.pg_attribute a
      WHERE a.attrelid = '%d' AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY a.attnum;
    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    var sql_find_index = (function () { /*
      SELECT c2.relname, i.indisprimary, i.indisunique, i.indisclustered, i.indisvalid, pg_catalog.pg_get_indexdef(i.indexrelid, 0, true),
        pg_catalog.pg_get_constraintdef(con.oid, true), contype, condeferrable, condeferred, c2.reltablespace
      FROM pg_catalog.pg_class c, pg_catalog.pg_class c2, pg_catalog.pg_index i
        LEFT JOIN pg_catalog.pg_constraint con ON (conrelid = i.indrelid AND conindid = i.indexrelid AND contype IN ('p','u','x'))
      WHERE c.oid = '%d' AND c.oid = i.indrelid AND i.indexrelid = c2.oid
      ORDER BY i.indisprimary DESC, i.indisunique DESC, c2.relname;
    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    var _this = this;
    this.q(sql_find_oid, this.table, function (oid_data, error) {
      var oid = oid_data.rows[0].oid;
      this.q(sql_find_types, oid, function(types_data, error) {
        this.q(sql_find_index, oid, function(indexes_rows, error) {
          callback(indexes_rows.rows);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  getRows: function (offset, limit, callback) {
    if (!offset) offset = 0;
    if (!limit) limit = 100;

    var sql = 'select * from "%s"."%s" limit %d offset %d';
    this.q(sql, this.schema, this.table, limit, offset, function(data) {
      data.limit = limit;
      data.offset = offset;
      callback(data);
    });
  },

  getTotalRows: function (callback) {
    var sql = 'select count(*) as rows_count from "%s"."%s"';
    this.q(sql, this.schema, this.table, function(data) {
      var count = parseInt(data.rows[0].rows_count, 10);
      callback ? callback(count) : console.log("Table rows count: " + this.table + " " + count);
    });
  },
});

Model.Table.create = function create (schema, tableName, callback) {
                           Arg.assert('string', 'string', 'function');

  sql = "CREATE TABLE %s (id SERIAL PRIMARY KEY);";
  if (schema != '' && schema != 'public') {
    sql += sprintf(" TABLESPACE %s", schema);
  }

  Model.base.q(sql, tableName, function (res, error) {
    callback(Model.Table(schema, tableName), res, error);
  });
};

Model.Table.publicTables = function publicTables (callback) {
  Model.base.connection().publicTables(function(tables, error) {

    var data = [];
    tables.forEach(function(e) {
      data.push('' + e.table_name);
    });

    callback(data);
  });
};

Model.Table.l = function (schema, table_name) {
  return new Model.Table(schema, table_name);
};