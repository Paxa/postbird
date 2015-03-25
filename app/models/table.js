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
    var sql = "select * from information_schema.columns where table_schema = '%s' and table_name = '%s'";
    this.q(sql, this.schema, this.table, function(data) {
      this.hasOID(function (hasOID) {
        if (hasOID) {
          data.rows.unshift({
            column_name: "oid",
            data_type: "oid",
            column_default: null,
            udt_name: "oid"
          });
        }
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
    }.bind(this));
  },

  hasOID: function (callback) {
    var sql = "select relhasoids from pg_catalog.pg_class where relname = '%s'";
    this.q(sql, this.table, function(data, error) {
      if (error) {
        callback(undefined, error);
      } else {
        callback(data.rows[0] && data.rows[0].relhasoids);
      }
    });
  },

  getColumnTypes: function (callback) {
    var sql = "select * from information_schema.columns where table_schema = '%s' and table_name = '%s';"
    this.q(sql, this.schema, this.table, function(data) {
      this.hasOID(function (hasOID) {
        var types = {};
        if (hasOID) {
          types["oid"] = {
            column_name: "oid",
            data_type: "oid",
            column_default: null,
            udt_name: "oid"
          };
        }
        data.rows.forEach(function(row) {
          types[row.column_name] = row;
          types[row.column_name].real_format = row.udt_name;
        });
        callback(types);
      })
    }.bind(this));
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
    var sql_find_oid = $u.commentOf(function () {/*
      SELECT c.oid,
        n.nspname,
        c.relname
      FROM pg_catalog.pg_class c
           LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname ~ '^(%s)$'
      ORDER BY 2, 3
    */});

    var sql_find_types = $u.commentOf(function () {/*
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
    */});

    var sql_find_index = $u.commentOf(function () {/*
      SELECT c2.relname, i.indisprimary, i.indisunique, i.indisclustered, i.indisvalid, pg_catalog.pg_get_indexdef(i.indexrelid, 0, true),
        pg_catalog.pg_get_constraintdef(con.oid, true), contype, condeferrable, condeferred, c2.reltablespace
      FROM pg_catalog.pg_class c, pg_catalog.pg_class c2, pg_catalog.pg_index i
        LEFT JOIN pg_catalog.pg_constraint con ON (conrelid = i.indrelid AND conindid = i.indexrelid AND contype IN ('p','u','x'))
      WHERE c.oid = '%d' AND c.oid = i.indrelid AND i.indexrelid = c2.oid
      ORDER BY i.indisprimary DESC, i.indisunique DESC, c2.relname;
    */});

    var _this = this;
    this.q(sql_find_oid, this.table, function (oid_data, error) {
      var oid = oid_data.rows[0].oid;
      //this.q(sql_find_types, oid, function(types_data, error) {
        this.q(sql_find_index, oid, function(indexes_rows, error) {
          callback(indexes_rows.rows);
        }.bind(this));
      //}.bind(this));
    }.bind(this));
  },

  getRows: function (offset, limit, options, callback) {
    if (!offset) offset = 0;
    if (!limit) limit = 100;
    if (!options) options = {};

    if (options.with_oid) {
      var sql = 'select oid, * from "%s"."%s" limit %d offset %d';
    } else {
      var sql = 'select * from "%s"."%s" limit %d offset %d';
    }

    this.q(sql, this.schema, this.table, limit, offset, function(data, error) {
      if (data) {
        data.limit = limit;
        data.offset = offset;
      }
      callback(data, error);
    });
  },

  getTotalRows: function (callback) {
    var sql = 'select count(*) as rows_count from "%s"."%s"';
    this.q(sql, this.schema, this.table, function(data, error) {
      if (error) {
        log.error(error);
      }
      var count = parseInt(data.rows[0].rows_count, 10);
      callback ? callback(count) : console.log("Table rows count: " + this.table + " " + count);
    });
  },

  insertRow: function (values, callback) {
    var sql = "insert into %s.%s values (%s)";
    var safeValues = values.map(function (val) {
      return "'" + val.toString() + "'";
    }).join(", ");

    this.q(sql, this.schema, this.table, safeValues, function (data, error) {
      callback(data, error);
    });
  },

  getSourceSql: function (callback) {
    var exporter = new SqlExporter({debug: false});
    // TODO: include schema
    exporter.addArgument('--table=' + this.table);
    exporter.addArgument("--schema-only");

    exporter.doExport(Model.base.connection(), function (result, stdout, stderr, process) {
      if (!result) {
        log.error("Run pg_dump failed");
        log.error(stderr);
      }
      stdout = stdout.toString();
      stdout = stdout.replace(/\n*^SET .+$/gim, "\n"); // remove SET ...;
      stdout = stdout.replace(/(^|\n|\r)(\-\-[\n\r]\-\-.+\n\-\-)/g, "\n"); // remove comments
      stdout = stdout.replace(/\n\n+/gim, "\n\n"); // remove extra new lines
      stdout = stdout.trim(); // remove padding spaces
      callback(stdout);
    });
  },

  diskSummary: function (callback) {
    var sql = $u.commentOf(function () {/*
      select
        pg_size_pretty(pg_total_relation_size(C.oid)) AS "total_size",
        reltuples as estimate_count,
        relkind
      FROM pg_class C
      LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
      WHERE
        nspname = '%s' and
        relname = '%s'
    */});

    this.q(sql, this.schema, this.table, function (result, error) {
      var row = result.rows[0];
      var type = row.relkind;
      // http://www.postgresql.org/docs/9.4/static/catalog-pg-class.html
      switch (row.relkind) {
        case "r": type = "table"; break;
        case "i": type = "index"; break;
        case "s": type = "sequence"; break;
        case "v": type = "view"; break;
        case "m": type = "materialized view"; break;
        case "c": type = "composite type"; break;
        case "t": type = "TOAST table"; break;
        case "f": type = "foreign table"; break;
      }
      callback(type, row.estimate_count, row.total_size);
    });
  },

});

Model.Table.create = function create (schema, tableName, options, callback) {
                           //Arg.assert('string', 'string', 'function');

  if (typeof options == 'function' && callback == undefined) {
    callback = options;
    options = {};
  }

  var sql = 'CREATE TABLE "%s"';
  if (options.empty) {
    sql += "()";
  } else {
    sql += "(id SERIAL PRIMARY KEY)";
  }

  if (schema != '' && schema != 'public') {
    sql += sprintf(" TABLESPACE %s", schema);
  }

  sql += ";";

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