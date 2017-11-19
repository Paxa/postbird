var SqlExporter = require('../../lib/sql_exporter');

var Table = global.Model.Table = Model.base.extend({

  tableType: null,
  types: {
    VIEW: 'VIEW',
    TABLE: 'BASE TABLE',
    MAT_VIEW: 'MATERIALIZED VIEW',
    FOREIGN_TABLE: 'FOREIGN TABLE'
  },

  init: function (schema, tableName, tableType) {
    this.schema = schema;
    this.table = tableName;
    if (tableType) {
      this.tableType = tableType;
    }
  },

  rename: function (newName, callback) {
    return this.getTableType().then(tableType => {
      var sql;
      if (tableType == this.types.VIEW) {
        sql = `ALTER VIEW ${this.sqlTable()} RENAME TO "${newName}"`;
      } else if (tableType == this.types.MAT_VIEW) {
        sql = `ALTER MATERIALIZED VIEW ${this.sqlTable()} RENAME TO "${newName}"`;
      } else if (tableType == this.types.FOREIGN_TABLE) {
        sql = `ALTER FOREIGN TABLE ${this.sqlTable()} RENAME TO "${newName}"`;
      } else if (tableType == this.types.TABLE) {
        sql = `ALTER TABLE ${this.sqlTable()} RENAME TO "${newName}"`;
      } else {
        throw new Error(`Can not rename ${tableType} (not supported or not implemented)`);
      }

      return this.q(sql).then((res) => {
        this.table = newName;
        return Promise.resolve(res);
      });
    });
  },

  remove: function(callback) {
    return this.getTableType().then(tableType => {

      if (tableType == this.types.VIEW) {
        return this.removeView(callback);
      } else if (tableType == this.types.MAT_VIEW) {
        return this.removeMatView(callback);
      } else if (tableType == this.types.FOREIGN_TABLE) {
        return this.removeFereignTable(callback);
      } else {
        return this.q(`DROP TABLE ${this.sqlTable()}`, callback);
      }
    });
  },

  drop: function (callback) {
    return this.remove(callback);
  },

  removeView: function (callback) {
    var sql = `DROP VIEW ${this.sqlTable()}`;
    return this.q(sql, (result, error) => {
      callback && callback(error ? false : true, error);
    });
  },

  removeMatView: function (callback) {
    var sql = `DROP MATERIALIZED VIEW ${this.sqlTable()}`;
    return this.q(sql, (result, error) => {
      callback && callback(error ? false : true, error);
    });
  },

  removeFereignTable: function (callback) {
    return this.q(`DROP FOREIGN TABLE ${this.sqlTable()}`, (result, error) => {
      callback && callback(error ? false : true, error);
    });
  },

  isMatView: function (callback) {
    return new Promise((resolve, reject) => {
      this.getTableType((tableType, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(tableType == "MATERIALIZED VIEW");
        }
        callback && callback(tableType == "MATERIALIZED VIEW", error);
      });
    });
  },

  isView: function (callback) {
    return this.getTableType().then(tableType => {
      callback && callback(tableType == "VIEW");
      return Promise.resolve(tableType == "VIEW");
    });
  },

  getTableType: function (callback) {
    if (this.tableType !== undefined && this.tableType !== null) {
      callback && callback(this.tableType);
      return Promise.resolve(this.tableType);
    }

    if (this.connection().server.supportMatViews()) {
      var sql = `
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = '${this.schema}' AND table_name = '${this.table}'
        UNION
        SELECT schemaname as table_schema, matviewname as table_name, 'MATERIALIZED VIEW' as table_type
        FROM pg_matviews
        WHERE schemaname = '${this.schema}' AND matviewname = '${this.table}'
      `
    } else {
      var sql = `
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = '${this.schema}' AND table_name = '${this.table}'
      `
    }

    return new Promise((resolve, reject) => {
      this.q(sql, (data, error) => {
        if (error) {
          console.log('ERROR', error);
          callback && callback(this.tableType, error);
          reject(error);
          return;
        }
        this.tableType = data.rows && data.rows[0] && data.rows[0].table_type;
        callback && callback(this.tableType);
        resolve(this.tableType);
      });
    });
  },

  getStructure: function (callback) {
    return this.isMatView().then(isMatView => {
      if (isMatView) {
        return this._getMatViewStructure(callback);
      } else {
        return this._getTableStructure(callback);
      }
    });
  },

  _getTableStructure: function (callback) {
    var sql = `
      SELECT
        a.attname as column_name,
        NOT a.attnotnull as is_nullable,
        information_schema._pg_char_max_length(information_schema._pg_truetypid(a.*, t.*), information_schema._pg_truetypmod(a.*, t.*)) as character_maximum_length,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) as column_default,
        a.attnotnull, a.attnum,
        (SELECT c.collname FROM pg_catalog.pg_collation c, pg_catalog.pg_type t
         WHERE c.oid = a.attcollation AND t.oid = a.atttypid AND a.attcollation <> t.typcollation) AS attcollation
      FROM pg_catalog.pg_attribute a
      JOIN pg_type t on t.oid = a.atttypid
      WHERE
        a.attrelid = (
          select c.oid from pg_catalog.pg_class c
          LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          where c.relname = '${this.table}' and n.nspname = '${this.schema}' limit 1
        ) AND
        a.attnum > 0 AND NOT a.attisdropped
      ORDER BY a.attnum;
    `;
    return new Promise((resolve, reject) => {
      this.q(sql, (data, error) => {
        if (error) {
          callback(data && data.rows, error);
          return;
        }
        this.hasOID((hasOID) => {
          if (hasOID) {
            data.rows.unshift({
              column_name: "oid",
              data_type: "oid",
              column_default: null,
              udt_name: "oid"
            });
          }
          this.getPrimaryKey((rows, error) => {
            if (error) {
              reject(error);
            } else {
              var keys = rows.map((r) => {
                return r.attname;
              });

              data.rows.forEach((row) => {
                row.is_primary_key = keys.indexOf(row.column_name) != -1;
              });
            }
            resolve(data.rows);
            callback && callback(data.rows);
          });
        });
      });
    });
  },

  _getMatViewStructure: function (callback) {
    var sql = `select attname as column_name, typname as udt_name, attnotnull, typdefault as column_default
               from pg_attribute a
               join pg_class c on a.attrelid = c.oid
               join pg_type t on a.atttypid = t.oid
               where relname = '%s' and attnum >= 1;`;

    return new Promise((resolve, reject) => {
      this.q(sql, this.table, (data, error) => {
        if (data && data.rows) {
          data.rows.forEach((row) => {
            row.is_nullable = row.attnotnull ? "NO" : "YES";
          });
          resolve(data.rows);
          callback && callback(data.rows);
        } else {
          if (error) reject(error);
          callback(null, error);
        }
      });
    });
  },

  hasOID: function (callback) {
    //var sql = "select relhasoids from pg_catalog.pg_class where relname = '%s'";
    var sql = `SELECT relhasoids FROM pg_catalog.pg_class, pg_catalog.pg_namespace n
      WHERE n.oid = pg_class.relnamespace AND nspname = '${this.schema}' AND relname = '${this.table}'`
    this.q(sql, (data, error) => {
      if (error) {
        callback(undefined, error);
      } else {
        callback(data && data.rows[0] && data.rows[0].relhasoids);
      }
    });
  },

  getColumnTypes: function (callback) {
    this.isMatView((isMatView) => {
      if (isMatView) {
        this._matview_getColumnTypes(callback);
      } else {
        this._table_getColumnTypes(callback);
      }
    });
  },

  _table_getColumnTypes: function (callback) {
    var sql = `
      SELECT
        a.attname as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        t.typname as udt_name,
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) as column_default
      FROM pg_catalog.pg_attribute a
      JOIN pg_type t on t.oid = a.atttypid
      WHERE
        a.attrelid = (
          select c.oid from pg_catalog.pg_class c
          LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          where c.relname = '${this.table}' and n.nspname = '${this.schema}' limit 1
        ) AND
        a.attnum > 0 AND NOT a.attisdropped
      ORDER BY a.attnum;
    `;
    var sql1 = `
      select * from information_schema.columns
      where table_schema = '${this.schema}' and table_name = '${this.table}';
    `;
    this.q(sql, (data, error) => {
      this.hasOID((hasOID) => {
        var types = {};
        if (hasOID) {
          types["oid"] = {
            column_name: "oid",
            data_type: "oid",
            column_default: null,
            udt_name: "oid"
          };
        }
        if (data.rows) {
          data.rows.forEach((row) => {
            types[row.column_name] = row;
            types[row.column_name].real_format = row.udt_name;
          });
        }
        callback(types, error);
      })
    });
  },

  _matview_getColumnTypes: function (callback) {
    this._getMatViewStructure((columns) => {
      var types = {};
      columns.forEach((row) => {
        types[row.column_name] = row;
        types[row.column_name].real_format = row.udt_name;
      });
      callback(types);
    });
  },

  getColumns: function (name, callback) {
    if (callback == undefined && typeof name == 'function') {
      callback = name;
      name = undefined;
    }

    return this.isMatView().then(isMatView => {
      if (isMatView) {
        return this._matview_getColumns(callback);
      } else {
        return this._table_getColumns(name, callback);
      }
    });
  },

  _table_getColumns: function (name, callback) {
    if (callback == undefined && typeof name == 'function') {
      callback = name;
      name = undefined;
    }

    var sql = "select * from information_schema.columns where table_schema = '%s' and table_name = '%s' %s;";
    var cond = name ? " and column_name = '" + name + "'" : '';
    return this.q(sql, this.schema, this.table, cond).then(rows => {
      callback && callback(rows.rows);
      return Promise.resolve(rows.rows);
    });
  },

  _matview_getColumns: function (callback) {
    return this._getMatViewStructure(callback);
  },

  // For tests only
  getColumnNames: function (callback) {
    return this.getColumns().then(rows => {
      var names = rows.map(c => { return c.column_name; });
      callback && callback(names);
      return Promise.resolve(names);
    });
  },

  getPrimaryKey: function (callback) {
    var sql = `SELECT pg_attribute.attname
      FROM pg_index, pg_class, pg_attribute
      WHERE
        pg_class.oid = '${this.sqlTable()}'::regclass AND
        indrelid = pg_class.oid AND
        pg_attribute.attrelid = pg_class.oid AND
        pg_attribute.attnum = any(pg_index.indkey)
        AND indisprimary;`;

    return new Promise((resolve, reject) => {
      this.q(sql, (data, error) => {
        callback && callback((data || {}).rows, error);
        error ? reject(error) : resolve(data.rows);
      });
    });
  },

  getColumnObj: function (name, callback) {
    return this.getColumns(name).then(data => {
      var row = new Model.Column(data[0].column_name, data[0]);
      row.table = this;
      callback && callback(row);
      return Promise.resolve(row);
    });
  },

  addColumnObj: function (column) {
    column.table = this;
    return column.create();
  },

  getRows: function (offset, limit, options, callback) {
    if (callback == undefined) callback = options, options = undefined;
    if (callback == undefined) callback = limit, limit = undefined;
    if (callback == undefined) callback = offset, offset = undefined;

    if (!offset) offset = 0;
    if (!limit) limit = 100;
    if (!options) options = {};

    return new Promise((resolve, reject) => {
      this.isView((isView) => {
        var sysColumns = [];
        if (options.with_oid) sysColumns.push('oid');
        if (!isView) sysColumns.push('ctid');

        //sysColumns = sysColumns.join(", ") + (sysColumns.length ? "," : "");
        var selectColumns = sysColumns.concat(['*']);
        if (options.extraColumns) {
          selectColumns = selectColumns.concat(options.extraColumns);
        }

        var orderSql = "";
        if (options.sortColumn) {
          var direction = options.sortDirection || 'asc';
          orderSql = ` order by "${options.sortColumn}" ${direction}`;
        }

        var condition = "";
        if (options.conditions) {
          condition = `where ${options.conditions.join(" and ")}`;
        }

        var sql = `select ${selectColumns.join(', ')} from ${this.sqlTable()} ${condition} ${orderSql} limit ${limit} offset ${offset}`;

        return this.q(sql, (data, error) => {
          if (data) {
            data.limit = limit;
            data.offset = offset;
          }
          // remove columns if we selected extra columns
          if (data && options.extraColumns) {
            data.fields.splice(data.fields.length - options.extraColumns.length, options.extraColumns.length);
          }
          callback && callback(data, error);
          error ? reject(error) : resolve(data);
        });
      });
    });
  },

  getTotalRows: function (callback) {
    var sql = `select count(*) as rows_count from ${this.sqlTable()}`;

    return new Promise((resolve, reject) => {
      this.q(sql, (data, error) => {
        if (error) {
          log.error(error);
          reject(error);
          callback && callback(null, error);
          return;
        }
        var count = parseInt(data.rows[0].rows_count, 10);
        callback && callback(count);//: console.log("Table rows count: " + this.table + " " + count);
        resolve(count);
      });
    });
  },

  getTotalRowsEstimate: function (callback) {
    var sql = `SELECT reltuples::bigint AS estimate
      FROM   pg_class
      WHERE  oid = '${this.sqlTable()}'::regclass`

    this.q(sql, (res) => {
      var row = res.rows[0];
      callback(row.estimate);
    });
  },

  insertRow: function (values, callback) {
    if (Array.isArray(values)) {
      var sql = `INSERT INTO ${this.sqlTable()} VALUES (%s)`;

      var safeValues = values.map((val) => {
        return "'" + val.toString() + "'";
      }).join(", ");

      return this.q(sql, safeValues, (data, error) => {
        callback && callback(data, error);
      });
    } else {
      var columns = Object.keys(values).map(col => {
        return `"${col}"`;
      });
      var sql = `insert into ${this.sqlTable()} (${columns.join(", ")}) values (%s)`;
      var safeValues = Object.values(values).map((val) => {
        return "'" + val.toString() + "'";
      }).join(", ");

      return this.q(sql, safeValues, (data, error) => {
        callback && callback(data, error);
      });
    }
  },

  deleteRowByCtid: function (ctid, callback) {
    var sql = `delete from ${this.sqlTable()} where ctid='${ctid}'`;
    return this.q(sql, (data, error) => {
      callback && callback(data, error);
    });
  },

  getSourceSql: function (callback) {
    var exporter = new SqlExporter({debug: true});
    // TODO: include schema
    exporter.addArgument('--table=' + this.sqlTable());
    exporter.addArgument("--schema-only");
    exporter.addArgument('--no-owner');

    return new Promise((resolve, reject) => {
      exporter.doExport(Model.base.connection(), (result, stdout, stderr, process) => {
        if (!result) {
          log.error("Run pg_dump failed");
          log.error(stderr);
        }
        stdout = stdout.toString();
        stdout = stdout.replace(/\n*^SET .+$/gim, "\n"); // remove SET ...;
        stdout = stdout.replace(/(^|\n|\r)(\-\-\r?\n\-\-.+\r?\n\-\-)/g, "\n"); // remove comments
        stdout = stdout.replace(/^\-\- Dumped from .+$/m, "\n"); // remove 'Dumped from ...'
        stdout = stdout.replace(/^\-\- Dumped by .+$/m, "\n"); // remove 'Dumped by ...'
        stdout = stdout.replace(/(\r?\n){2,}/gim, "\n\n"); // remove extra new lines
        stdout = stdout.trim(); // remove padding spaces

        // some views craeted by extensions can't be dumped
        if (stdout.length == 0) {
          this.getTableType((tableType) => {

            if (tableType == 'VIEW') {
              this.q(`select pg_get_viewdef('${this.schema}.${this.table}', true);`, (defFesult, error) => {
                var source = defFesult.rows[0].pg_get_viewdef;
                callback && callback(defFesult.rows[0].pg_get_viewdef, error && error.message);
                error ? reject(error) : resolve(source);
              });
            } else {
              callback && callback(stdout, result ? undefined : stderr);
              result ? resolve(stdout) : reject(stderr);
            }
          });
        } else {
          callback && callback(stdout, result ? undefined : stderr);
          result ? resolve(stdout) : reject(stderr);
        }
      });
    });
  },

  diskSummary: function (callback) {
    var sql = `
      select
        pg_size_pretty(pg_total_relation_size(C.oid)) AS "total_size",
        reltuples as estimate_count,
        relkind
      FROM pg_class C
      LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
      WHERE
        nspname = '%s' and
        relname = '%s'
    `;

    this.q(sql, this.schema, this.table, (result, error) => {
      if (!result) {
        callback("error getting talbe info", '', '', error);
        return;
      }
      var row = result.rows[0];
      var type = row.relkind;
      // TODO: dry
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

  truncate(cascade, callback) {
    var sql = `truncate table ${this.sqlTable()} ${cascade ? "CASCADE" : ""};`;
    return this.q(sql, (data, error) => {
      callback && callback(data, error);
    });
  },

  getConstraints(callback) {
    var sql = `
      SELECT *, pg_get_constraintdef(oid, true) as pretty_source
      FROM pg_constraint WHERE conrelid = '${this.sqlTable()}'::regclass
    `;
    return this.q(sql, (data, error) => {
      callback && callback(data, error);
    });
  },

  dropConstraint(constraintName, callback) {
    var sql = `ALTER TABLE ${this.sqlTable()} DROP CONSTRAINT ${constraintName};`;
    this.q(sql, (data, error) => {
      callback(data, error);
    });
  },

  sqlTable() {
    return `"${this.schema}"."${this.table}"`;
  },

  refreshMatView() {
    return this.q(`REFRESH MATERIALIZED VIEW ${this.sqlTable()}`);
  }
});

Model.Table.create = function create (schema, tableName, options, callback) {

  if (typeof options == 'function' && callback == undefined) {
    callback = options;
    options = {};
  }

  if (options == undefined) {
    options = {};
  }

  var columns = "()";
  if (!options.empty) {
    columns = "(id SERIAL PRIMARY KEY)";
  }

  var schemaSql = schema && schema != '' ? `"${schema}".` : '';
  var sql = `CREATE TABLE ${schemaSql}"${tableName}" ${columns};`;

  return Model.base.q(sql).then(res => {
    callback && callback(new Model.Table(schema, tableName), res);
    return Promise.resolve(new Model.Table(schema, tableName));
  }).catch((error) => {
    callback && callback(new Model.Table(schema, tableName), null, error);
    return Promise.reject((error));
  });
};

Model.Table.types = Model.Table.prototype.types;

module.exports = Table;
