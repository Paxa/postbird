var sprintf = require("sprintf-js").sprintf;

global.Model.Table = Model.base.extend({

  tableType: null,
  types: {
    VIEW: 'VIEW',
    TABLE: 'BASE TABLE',
    MAT_VIEW: 'MATERIALIZED VIEW'
  },

  init: function (schema, table_name, tableType) {
    this.schema = schema;
    this.table = table_name;
    if (tableType) {
      this.tableType = tableType;
    }
  },

  rename: function (new_name, callback) {
    var sql = `ALTER INDEX "${this.schema}"."${this.table}" RENAME TO  ${new_name}`;
    this.q(sql, (data, error) => {
      this.table = new_name;
      callback(data, error);
    });
  },

  remove: function(callback) {
    this.getTableType((tableType) => {
      if (tableType == this.types.VIEW) {
        this.removeView(callback);
      } else if (tableType == this.types.MAT_VIEW) {
        this.removeMatView(callback);
      } else {
        this.q(`DROP TABLE "${this.schema}"."${this.table}"`, callback);
      }
    });
  },

  drop: function (callback) {
    this.remove(callback);
  },

  removeView: function (callback) {
    var sql = `drop view "${this.schema}"."${this.table}"`;
    this.q(sql, (result, error) => {
      callback(error ? false : true, error);
    });
  },

  removeMatView: function (callback) {
    var sql = `drop materialized view "${this.schema}"."${this.table}"`;
    this.q(sql, (result, error) => {
      callback(error ? false : true, error);
    });
  },

  dropFereign: function (callback) {
    this.q(`DROP FOREIGN TABLE "${this.schema}"."${this.table}"`, (result, error) => {
      callback(error ? false : true, error);
    });
  },

  safeDrop: function (callback) {
    this.q(`DROP TABLE IF EXISTS "${this.schema}"."${this.table}" CASCADE`, callback);
  },

  isMatView: function (callback) {
    this.getTableType((tableType, error) => {
      callback(tableType == "MATERIALIZED VIEW", error);
    });
  },

  isView: function (callback) {
    this.getTableType((tableType) => {
      callback(tableType == "VIEW")
    });
  },

  getTableType: function (callback) {
    if (this.tableType !== undefined && this.tableType !== null) {
      callback(this.tableType);
      return;
    }

    if (this.connection().supportMatViews()) {
      var sql = `
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        where table_schema = '${this.schema}' and table_name = '${this.table}'
        union
        select schemaname as table_schema, matviewname as table_name, 'MATERIALIZED VIEW' as table_type
        from pg_matviews
        where schemaname = '${this.schema}' and matviewname = '${this.table}'
      `
    } else {
      var sql = `
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        where table_schema = '${this.schema}' and table_name = '${this.table}'
      `
    }

    this.q(sql, (data, error) => {
      if (error) {
        console.log('ERROR', error);
        callback(this.tableType, error);
        return;
      }
      this.tableType = data.rows && data.rows[0] && data.rows[0].table_type;
      callback(this.tableType);
    });
  },

  getStructure: function (callback) {
    this.isMatView((isMatView) => {
      if (isMatView) {
        this._getMatViewStructure(callback);
      } else {
        this._getTableStructure(callback);
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
          if (!error) {
            var keys = rows.map((r) => {
              return r.attname;
            });

            data.rows.forEach((row) => {
              row.is_primary_key = keys.indexOf(row.column_name) != -1;
            });
          }
          callback(data.rows);
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

    this.q(sql, this.table, (data, error) => {
      if (data && data.rows) {
        data.rows.forEach((row) => {
          row.is_nullable = row.attnotnull ? "NO" : "YES";
        });
        callback(data.rows);
      } else {
        callback(null, error);
      }
    });
  },

  hasOID: function (callback) {
    //var sql = "select relhasoids from pg_catalog.pg_class where relname = '%s'";
    var sql = `select relhasoids from pg_catalog.pg_class, pg_catalog.pg_namespace n
      where n.oid = pg_class.relnamespace and nspname = '${this.schema}' and relname = '${this.table}'`
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
    this.q(sql, (data) => {
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
        data.rows.forEach((row) => {
          types[row.column_name] = row;
          types[row.column_name].real_format = row.udt_name;
        });
        callback(types);
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

    this.isMatView((isMatView) => {
      if (isMatView) {
        this._matview_getColumns(callback);
      } else {
        this._table_getColumns(name, callback);
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
    this.q(sql, this.schema, this.table, cond, (rows) => {
      callback(rows.rows);
    });
  },

  _matview_getColumns: function (callback) {
    this._getMatViewStructure(callback);
  },

  getColumnNames: function (callback) {
    this.getColumns((rows) => {
      var names = [];
      rows.forEach((c) => { names.push(c.column_name); });
      callback(names);
    });
  },

  getPrimaryKey: function (callback) {
    var sql = `SELECT pg_attribute.attname
      FROM pg_index, pg_class, pg_attribute
      WHERE
        pg_class.oid = '${this.schema}.${this.table}'::regclass AND
        indrelid = pg_class.oid AND
        pg_attribute.attrelid = pg_class.oid AND
        pg_attribute.attnum = any(pg_index.indkey)
        AND indisprimary;`;

    this.q(sql, (data, error) => {
      callback((data || {}).rows, error);
    });
  },

  // ALTER TABLE mytable ADD COLUMN mycolumn character varying(50) NOT NULL DEFAULT 'foo';
  // TODO: Somewhere here is wrong
  addColumn: function (name, type, max_length, default_value, is_null, callback) {
    var type_with_length = max_length ? type + "(" + max_length + ")" : type;
    var null_sql = is_null ? "NULL" : "NOT NULL";
    var default_sql = this._default_sql(default_value);

    var sql = `ALTER TABLE "${this.schema}"."${this.table}" ADD ${name} ${type_with_length} ${default_sql} ${null_sql};`;
    this.q(sql, (data, error) => {
      callback(data, error);
    });
  },

  dropColumn: function (name, callback) {
    var column = new Model.Column(name, {});
    column.table = this;
    column.drop((data, error) => {
      callback(data, error);
    });
  },

  getColumnObj: function (name, callback) {
    this.getColumns(name, (data) => {
      var row = new Model.Column(data[0].column_name, data[0]);
      row.table = this;
      callback(row);
    });
  },

  addColumnObj: function (columnObj, callback) {
    this.addColumn(columnObj.name, columnObj.type, columnObj.max_length, columnObj.default_value, columnObj.allow_null, () => {
      columnObj.table = this;
      callback(columnObj);
    });
  },

  addIndex: function (name, uniq, columns, method, callback) {
    var uniq_sql = uniq ? 'UNIQUE' : '';
    var columns_sql = Array.isArray(columns) ? columns.join(', ') : columns.toString();
    if (!method) method = 'btree';

    var sql = `CREATE ${uniq_sql} INDEX CONCURRENTLY ${name} ON "${this.schema}"."${this.table}" USING ${method} (%s);`;

    this.q(sql, columns_sql, (data, error) => {
      callback(data, error);
    });
  },

  dropIndex: function (indexName, callback) {
    var sql = `DROP INDEX CONCURRENTLY ${this.schema}.${indexName};`;
    this.q(sql, (data, error) => {
      callback(data, error);
    });
  },

  _default_sql: function (default_value) {
    if (default_value !== undefined && default_value !== '') {
      return 'DEFAULT ' + JSON.stringify(default_value).replace(/^"/, "'").replace(/"$/, "'");
    } else {
      return '';
    }
  },

  // find indexes
  getIndexes: function (callback) {
    var sql_find_oid = `
      SELECT c.oid,
        n.nspname,
        c.relname
      FROM pg_catalog.pg_class c
           LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = '${this.schema}' and c.relname = '${this.table}'
      ORDER BY 2, 3;`;

    var sql_find_types = `
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
      ORDER BY a.attnum;`

    var sql_find_index = `
      SELECT c2.relname, i.indisprimary, i.indisunique, i.indisclustered, i.indisvalid, pg_catalog.pg_get_indexdef(i.indexrelid, 0, true),
        pg_catalog.pg_get_constraintdef(con.oid, true), contype, condeferrable, condeferred, c2.reltablespace
      FROM pg_catalog.pg_class c, pg_catalog.pg_class c2, pg_catalog.pg_index i
        LEFT JOIN pg_catalog.pg_constraint con ON (conrelid = i.indrelid AND conindid = i.indexrelid AND contype IN ('p','u','x'))
      WHERE c.oid = '%d' AND c.oid = i.indrelid AND i.indexrelid = c2.oid
      ORDER BY i.indisprimary DESC, i.indisunique DESC, c2.relname;`;

    var _this = this;

    this.q(sql_find_oid, (oid_data, error) => {
      if (!oid_data || !oid_data.rows || !oid_data.rows[0]) {
        callback(null, new Error(`Relation "${this.schema}"."${this.table}" does not exist`));
        return;
      }
      var oid = oid_data.rows[0].oid;
      //this.q(sql_find_types, oid, (types_data, error) => {
        _this.q(sql_find_index, oid, (indexes_rows, error) => {
          callback(indexes_rows.rows, error);
        });
      //});
    });
  },

  getRows: function (offset, limit, options, callback) {
    if (callback == undefined) callback = options, options = undefined;
    if (callback == undefined) callback = limit, limit = undefined;
    if (callback == undefined) callback = offset, offset = undefined;

    if (!offset) offset = 0;
    if (!limit) limit = 100;
    if (!options) options = {};

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

      var sql = `select ${selectColumns.join(', ')} from "${this.schema}"."${this.table}" ${condition} ${orderSql} limit ${limit} offset ${offset}`;

      this.q(sql, (data, error) => {
        if (data) {
          data.limit = limit;
          data.offset = offset;
        }
        // remove columns if we selected extra columns
        if (options.extraColumns) {
          data.fields.splice(data.fields.length - options.extraColumns.length, options.extraColumns.length);
        }
        callback(data, error);
      });
    });
  },

  getTotalRows: function (callback) {
    var sql = 'select count(*) as rows_count from "%s"."%s"';
    this.q(sql, this.schema, this.table, (data, error) => {
      if (error) {
        log.error(error);
      }
      var count = parseInt(data.rows[0].rows_count, 10);
      callback ? callback(count) : console.log("Table rows count: " + this.table + " " + count);
    });
  },

  getTotalRowsEstimate: function (callback) {
    var sql = `SELECT reltuples::bigint AS estimate
      FROM   pg_class
      WHERE  oid = '%s.%s'::regclass`

    this.q(sql, this.schema, this.table, (res) => {
      var row = res.rows[0];
      callback(row.estimate);
    });
  },

  insertRow: function (values, callback) {
    if (Array.isArray(values)) {
      var sql = `insert into "${this.schema}"."${this.table}" values (%s)`;

      var safeValues = values.map((val) => {
        return "'" + val.toString() + "'";
      }).join(", ");

      this.q(sql, safeValues, (data, error) => {
        callback(data, error);
      });
    } else {
      var columns = Object.keys(values);
      var sql = `insert into "${this.schema}"."${this.table}" (${columns.join(", ")}) values (%s)`;
      var safeValues = Object.values(values).map((val) => {
        return "'" + val.toString() + "'";
      }).join(", ");

      this.q(sql, safeValues, (data, error) => {
        callback(data, error);
      });
    }
  },

  deleteRowByCtid: function (ctid, callback) {
    var sql = `delete from "${this.schema}"."${this.table}" where ctid='${ctid}'`;
    this.q(sql, (data, error) => {
      callback(data, error);
    });
  },

  getSourceSql: function (callback) {
    var exporter = new SqlExporter({debug: true});
    // TODO: include schema
    exporter.addArgument('--table=' + this.schema + '.' + this.table);
    exporter.addArgument("--schema-only");
    exporter.addArgument('--no-owner');

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
      callback(stdout, result ? undefined : stderr);
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

  truncate(callback) {
    var sql = `truncate table ${this.schema}.${this.table};`;
    this.q(sql, (data, error) => {
      callback(data, error);
    });
  },

  getConstraints(callback) {
    var sql = `
      SELECT *, pg_get_constraintdef(oid, true) as pretty_source
      FROM pg_constraint WHERE conrelid = '${this.schema}.${this.table}'::regclass
    `;
    this.q(sql, (data, error) => {
      callback(data, error);
    });
  },

  dropConstraint(constraintName, callback) {
    var sql = `ALTER TABLE "${this.schema}"."${this.table}" DROP CONSTRAINT ${constraintName};`;
    this.q(sql, (data, error) => {
      callback(data, error);
    });
  }

});

Model.Table.create = function create (schema, tableName, options, callback) {

  if (typeof options == 'function' && callback == undefined) {
    callback = options;
    options = {};
  }

  var columns = "()";
  if (!options.empty) {
    columns = "(id SERIAL PRIMARY KEY)";
  }

  var schemaSql = schema && schema != '' ? `"${schema}".` : '';
  var sql = `CREATE TABLE ${schemaSql}"${tableName}" ${columns};`;

  Model.base.q(sql, (res, error) => {
    callback(Model.Table(schema, tableName), res, error);
  });
};

Model.Table.publicTables = function publicTables (callback) {
  Model.base.connection().publicTables((tables, error) => {

    var data = [];
    tables.forEach((e) => {
      data.push('' + e.table_name);
    });

    callback(data);
  });
};

Model.Table.l = function (schema, table_name) {
  return new Model.Table(schema, table_name);
};


