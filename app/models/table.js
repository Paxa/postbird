var SqlExporter = require('../../lib/sql_exporter');
var pgEscape = require('pg-escape');

var TABLE_TYPES = {
  VIEW: 'VIEW',
  TABLE: 'BASE TABLE',
  MAT_VIEW: 'MATERIALIZED VIEW',
  FOREIGN_TABLE: 'FOREIGN TABLE'
};

var TABLE_TYPE_ALIASES = {
  'SYSTEM VIEW': 'VIEW',
  'FOREIGN': 'FOREIGN TABLE',
}

/*::

type Table_Type = 'VIEW' | 'BASE TABLE' | 'MATERIALIZED VIEW' | 'FOREIGN TABLE';

interface Table_ColumnType {
  column_name: string
  data_type: string
  column_default: any
  udt_name: string
  ordinal_position: number
}

interface Table_ColumnTypes {
  [column: string] : Table_ColumnType;
}

interface Table_DiskUsage {
  total: number
  table: number
  index: number
  toast: number
}

interface Table_DiskSummary {
  type: string
  estimateCount: number
  diskUsage: Table_DiskUsage
}

interface Table_getRows_Options {
  conditions?: string[]
  with_oid?: boolean
  extraColumns?: string[]
  sortColumn?: string
  sortDirection?: string
}

interface Table_getRows_Result extends pg.QueryResult {
  relations: string[]
}
*/

class Table extends ModelBase {
  /*::
  tableType: Table_Type
  schema: string
  table: string
  static types: any
  static typeAliasess: any
  */

  static create (schema, tableName, options /*:: ?: any */) {

    if (options == undefined) {
      options = {};
    }

    var columns = "()";
    if (!options.empty) {
      columns = "(id SERIAL PRIMARY KEY)";
    }

    var schemaSql = schema && schema != '' ? `"${schema}".` : '';
    var sql = `CREATE TABLE ${schemaSql}"${tableName}" ${columns};`;

    return ModelBase.q(sql).then(res => {
      return Promise.resolve(new Model.Table(schema, tableName));
    }).catch((error) => {
      return Promise.reject((error));
    });
  }

  constructor (schema, tableName, tableType /*:: ?: Table_Type */) {
    super();

    if (TABLE_TYPE_ALIASES[tableType]) {
      tableType = TABLE_TYPE_ALIASES[tableType];
    }

    this.tableType = tableType || null;

    this.schema = schema;
    this.table = tableName;
  }

  rename (newName) /*: Promise<QueryResult> */ {
    return this.getTableType().then(tableType => {
      var sql;
      if (tableType == TABLE_TYPES.VIEW) {
        sql = `ALTER VIEW ${this.sqlTable()} RENAME TO "${newName}"`;
      } else if (tableType == TABLE_TYPES.MAT_VIEW) {
        sql = `ALTER MATERIALIZED VIEW ${this.sqlTable()} RENAME TO "${newName}"`;
      } else if (tableType == TABLE_TYPES.FOREIGN_TABLE) {
        sql = `ALTER FOREIGN TABLE ${this.sqlTable()} RENAME TO "${newName}"`;
      } else if (tableType == TABLE_TYPES.TABLE) {
        sql = `ALTER TABLE ${this.sqlTable()} RENAME TO "${newName}"`;
      } else {
        throw new Error(`Can not rename ${tableType} (not supported or not implemented)`);
      }

      return this.q(sql).then((res) => {
        this.table = newName;
        return Promise.resolve(res);
      });
    });
  }

  remove () /*: Promise<QueryResult> */ {
    return this.getTableType().then(tableType => {

      if (tableType == TABLE_TYPES.VIEW) {
        return this.removeView();
      } else if (tableType == TABLE_TYPES.MAT_VIEW) {
        return this.removeMatView();
      } else if (tableType == TABLE_TYPES.FOREIGN_TABLE) {
        return this.removeFereignTable();
      } else {
        return this.q(`DROP TABLE ${this.sqlTable()}`);
      }
    });
  }

  drop () {
    return this.remove();
  }

  removeView () /*: Promise<QueryResult> */ {
    var sql = `DROP VIEW ${this.sqlTable()}`;
    return this.q(sql);
  }

  removeMatView () /*: Promise<QueryResult> */ {
    var sql = `DROP MATERIALIZED VIEW ${this.sqlTable()}`;
    return this.q(sql);
  }

  removeFereignTable () /*: Promise<QueryResult> */ {
    return this.q(`DROP FOREIGN TABLE ${this.sqlTable()}`);
  }

  async isMatView () /*: Promise<boolean> */ {
    return (await this.getTableType()) == "MATERIALIZED VIEW";
  }

  async isView () /*: Promise<boolean> */ {
    return (await this.getTableType()) == "VIEW";
  }

  async isSequence () /*: Promise<boolean> */ {
    var sql = `SELECT 1 as exists FROM information_schema.sequences WHERE sequence_schema = '${this.schema}' AND sequence_name = '${this.table}'`;
    var data = await this.q(sql);
    return data.rows.length > 0;
  }

  async sequenceInfo () {
    var sql = `SELECT * FROM information_schema.sequences WHERE sequence_schema = '${this.schema}' AND sequence_name = '${this.table}'`;
    var data = await this.q(sql);
    if (data.rows[0]) {
      var extras = await this.connection().findSequences(this.schema, this.table);
      return Object.assign(data.rows[0], extras.rows[0]);
    }
  }

  async getTableType () /*: Promise<Table_Type> */ {
    if (this.tableType !== undefined && this.tableType !== null) {
      return Promise.resolve(this.tableType /*:: as Table_Type */);
    }

    var sqlWithMatView = `
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = '${this.schema}' AND table_name = '${this.table}'
      UNION
      SELECT schemaname as table_schema, matviewname as table_name, 'MATERIALIZED VIEW' as table_type
      FROM pg_matviews
      WHERE schemaname = '${this.schema}' AND matviewname = '${this.table}'
    `;

    var sqlWithoutMatViews = `
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = '${this.schema}' AND table_name = '${this.table}'
    `;

    try {
      var sql = this.connection().server.supportMatViews() ? sqlWithMatView : sqlWithoutMatViews;
      var data = await this.q(sql);
      this.tableType = data.rows && data.rows[0] && data.rows[0].table_type;

      if (TABLE_TYPE_ALIASES[this.tableType]) {
        this.tableType = TABLE_TYPE_ALIASES[this.tableType];
      }
    } catch (error) {
      console.error(error);
      this.tableType = 'BASE TABLE';
    }
    return this.tableType /*:: as Table_Type */;
  }

  getStructure () {
    return this.isMatView().then(isMatView => {
      if (isMatView) {
        return this._getMatViewStructure();
      } else {
        return this._getTableStructure();
      }
    });
  }

  async _getTableStructure () {
    var collationQuery = ''
    if (this.connection().supportPgCollation()) {
      collationQuery = `, (SELECT c.collname FROM pg_catalog.pg_collation c, pg_catalog.pg_type t WHERE c.oid = a.attcollation AND t.oid = a.atttypid AND a.attcollation <> t.typcollation) AS attcollation`;
    }

    var maxLengthQuery = ''
    if (this.connection().supportColMaxLength()) {
      maxLengthQuery = `information_schema._pg_char_max_length(information_schema._pg_truetypid(a.*, t.*), information_schema._pg_truetypmod(a.*, t.*)) as character_maximum_length,`;
    }

    var colDefaultQuery = ''
    if (this.connection().supportColDefault()) {
      colDefaultQuery = `
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) as column_default,`;
    }

    var sql = `
      SELECT
        a.attname as column_name,
        NOT a.attnotnull as is_nullable,
        ${maxLengthQuery}
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        ${colDefaultQuery}
        a.attnotnull, a.attnum
        ${collationQuery}
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

    var data = await this.q(sql);
    var hasOID = await this.hasOID();

    if (hasOID) {
      data.rows.unshift({
        column_name: "oid",
        data_type: "oid",
        column_default: null,
        udt_name: "oid"
      });
    }

    var rows = await this.getPrimaryKey();
    var keys = rows.map((r) => {
      return r.attname;
    });

    data.rows.forEach((row) => {
      row.is_primary_key = keys.indexOf(row.column_name) != -1;
    });

    return data.rows;
  }

  async _getMatViewStructure () {
    var sql = `select attname as column_name, typname as udt_name, attnotnull, typdefault as column_default
               from pg_attribute a
               join pg_class c on a.attrelid = c.oid
               join pg_type t on a.atttypid = t.oid
               where relname = '${this.table}' and attnum >= 1;`;

    var data = await this.q(sql);

    data.rows.forEach((row) => {
      row.is_nullable = row.attnotnull ? "NO" : "YES";
    });

    return data.rows;
  }

  async hasOID () /*: Promise<boolean> */ {
  var sql = `SELECT TRUE as relhasoids FROM pg_attribute WHERE
    attrelid = '${this.sqlTable()}'::regclass AND
    attname = 'oid' AND
    NOT attisdropped`;

    if (this.connection().supportClassRelhasoids()) {
      sql = `SELECT relhasoids FROM pg_catalog.pg_class, pg_catalog.pg_namespace n WHERE
        n.oid = pg_class.relnamespace AND
        nspname = '${this.schema}' AND
        relname = '${this.table}'`;
    }
    var data = await this.q(sql);
    return data && data.rows[0] && data.rows[0].relhasoids;
  }

  async getColumnTypes () /*: Promise<Table_ColumnTypes> */ {
    if (await this.isMatView()) {
      return this._matview_getColumnTypes();
    } else {
      return this._table_getColumnTypes();
    }
  }

  async _table_getColumnTypes () {
    var colDefaultQuery = '1'
    if (this.connection().supportColDefault()) {
      colDefaultQuery = `
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) as column_default`;
    }

    var sql = `
      SELECT
        a.attname as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        t.typname as udt_name,
        NOT a.attnotnull as is_nullable,
        ${colDefaultQuery}
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

    var data = await this.q(sql)
    var types = {};
    if (await this.hasOID()) {
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

    return types;
  }

  async _matview_getColumnTypes () {
    var columns = await this._getMatViewStructure();
    var types = {};
    columns.forEach((row) => {
      types[row.column_name] = row;
      types[row.column_name].real_format = row.udt_name;
    });
    return types;
  }

  async getColumns (name /*:: ?: string */) /*: Promise<Table_ColumnTypes> */ {
    if (await this.isMatView()) {
      return this._matview_getColumns();
    } else {
      return this._table_getColumns(name);
    }
  }

  _table_getColumns (name) {
    var sql = `SELECT columns.*, atttypmod
                FROM information_schema.columns, pg_catalog.pg_attribute
                WHERE columns.table_schema = '${this.schema}' AND
                      columns.table_name = '${this.table}' AND
                      pg_attribute.attrelid = '${this.sqlTable()}'::regclass AND
                      pg_attribute.attname = columns.column_name
                      %s;`;
    var cond = name ? ` AND column_name = '${name}'` : '';

    return this.q(sql, cond).then(rows => {
      return Promise.resolve(rows.rows);
    });
  }

  _matview_getColumns () {
    return this._getMatViewStructure();
  }

  // For tests only
  getColumnNames () {
    return this.getColumns().then(rows => {
      var names = Object.values(rows).map(c => { return c.column_name; });
      return Promise.resolve(names);
    });
  }

  getPrimaryKey () {
    var indkeySql = this.connection().supportVectorAsArray() ?
      `pg_attribute.attnum = any(pg_index.indkey)` :
      `pg_attribute.attnum in(indkey[0], indkey[1], indkey[2], indkey[3], indkey[4], indkey[5], indkey[6], indkey[7], indkey[8], indkey[9])`;

    var sql = `SELECT pg_attribute.attname
      FROM pg_index, pg_class, pg_attribute
      WHERE
        pg_class.oid = '${this.sqlTable()}'::regclass AND
        indrelid = pg_class.oid AND
        pg_attribute.attrelid = pg_class.oid AND
        ${indkeySql}
        AND indisprimary;`;

    return this.q(sql).then(data => {
      return Promise.resolve(data.rows);
    });
  }

  getColumnObj (name) /*: Promise<Model.Column> */ {
    return this.getColumns(name).then(data => {
      var row = new Model.Column(data[0].column_name, data[0]);
      row.table = this;
      return Promise.resolve(row);
    });
  }

  addColumnObj (column /*: Model.Column */) {
    column.table = this;
    return column.create();
  }

  async getRows (offset, limit, options /*: Table_getRows_Options */) /*: Promise<Table_getRows_Result> */{
    if (!offset) offset = 0;
    if (!limit) limit = 100;
    if (!options) options = {};

    var sysColumns = [];
    if (options.with_oid) sysColumns.push('oid');
    if (!await this.isView() && this.connection().supportCtid()) sysColumns.push('ctid');

    //sysColumns = sysColumns.join(", ") + (sysColumns.length ? "," : "");
    var selectColumns = sysColumns.concat(['*']);
    if (options.extraColumns) {
      selectColumns = selectColumns.concat(options.extraColumns);
    }

    var orderSql = "";
    if (options.sortColumn) {
      var direction = options.sortDirection || 'asc';
      orderSql = ` ORDER BY "${options.sortColumn}" ${direction}`;
    }

    var condition = "";
    if (options.conditions) {
      condition = `WHERE ${options.conditions.join(" AND ")}`;
    }

    var sql = `SELECT ${selectColumns.join(', ')} FROM ${this.sqlTable()} ${condition} ${orderSql} LIMIT ${limit} OFFSET ${offset}`;

    return this.q(sql).then(data => {
      if (data) {
        data.limit = limit;
        data.offset = offset;
      }
      // remove columns if we selected extra columns
      if (data && options.extraColumns) {
        data.fields.splice(data.fields.length - options.extraColumns.length, options.extraColumns.length);
      }
      return Promise.resolve(data);
    });
  }

  async getRowsSimple (column, value) {
    var sql = pgEscape(`SELECT * FROM ${this.sqlTable()} WHERE "${column}" = %L`, value);
    var data = await this.q(sql);

    //console.log(JSON.stringify(data.fields, null, 2));

    PgTypeNames.extendFields(data);

    return data;
  }

  async getTotalRows () /*: Promise<number> */ {
    var sql = `SELECT count(*) AS rows_count FROM ${this.sqlTable()}`;
    var data = await this.q(sql);
    return parseInt(data.rows[0].rows_count, 10);
  }

  insertRow (values) {
    if (Array.isArray(values)) {
      var sql = `INSERT INTO ${this.sqlTable()} VALUES (%s)`;

      var safeValues = values.map((val) => {
        return "'" + val.toString() + "'";
      }).join(", ");

      return this.q(sql, safeValues);
    } else {
      var columns = Object.keys(values).map(col => {
        return `"${col}"`;
      });
      var sql = `INSERT INTO ${this.sqlTable()} (${columns.join(", ")}) VALUES (%s)`;
      var safeValues = Object.values(values).map(val => {
        return "'" + val.toString() + "'";
      }).join(", ");

      return this.q(sql, safeValues);
    }
  }

  deleteRowByCtid (ctid) {
    var sql = `DELETE FROM ${this.sqlTable()} WHERE ctid='${ctid}'`;
    return this.q(sql);
  }

  async getCockroachSourceSql(callback/*:: ?: Function */) {
    try {
      var res = await this.q(`SHOW CREATE ${this.sqlTable()}`);
      var source = res.rows && res.rows[0] && res.rows[0].create_statement;
      callback && callback(source);
      return source;
    } catch (error) {
      callback && callback(null, error);
      throw error;
    }
  }

  async getSourceSql (callback/*:: ?: Function */) {

    if (this.connection().isCockroach) {
      return this.getCockroachSourceSql(callback);
    }

    // some kind of bug in pd_dump, it doesn't show view definitions anymore.
    // use pg_get_viewdef() as workaround
    var tableType = await this.getTableType();

    if (tableType == TABLE_TYPES.VIEW) {
      var sql = `SELECT pg_get_viewdef('${this.table}', true) AS view_def`;
      return new Promise((resolve, reject) => {
        this.q(sql).then(res => {
          var viewSource = res.rows[0] && res.rows[0].view_def;
          callback && callback(viewSource);
          resolve(viewSource);
        }).catch(error => {
          reject(error);
          callback(undefined, error);
        })
      });
    }

    var exporter = new SqlExporter({debug: true});
    // TODO: include schema
    exporter.addArgument('--table=' + this.sqlTable());
    exporter.addArgument("--schema-only");
    exporter.addArgument('--no-owner');

    return new Promise((resolve, reject) => {
      exporter.doExport(ModelBase.connection(), (result, stdout, stderr, process) => {
        if (!result) {
          logger.error("Run pg_dump failed");
          logger.error(stderr);
        }
        stdout = stdout.toString();
        stdout = stdout.replace(/\n*^SET .+$/gim, "\n"); // remove SET ...;
        stdout = stdout.replace(/(^|\n|\r)(--\r?\n--.+\r?\n--)/g, "\n"); // remove comments
        stdout = stdout.replace(/^-- Dumped from .+$/m, "\n"); // remove 'Dumped from ...'
        stdout = stdout.replace(/^-- Dumped by .+$/m, "\n"); // remove 'Dumped by ...'
        stdout = stdout.replace(/(\r?\n){2,}/gim, "\n\n"); // remove extra new lines
        stdout = stdout.replace("SELECT pg_catalog.set_config('search_path', '', false);", '');
        stdout = stdout.trim(); // remove padding spaces

        // some views craeted by extensions can't be dumped
        if (stdout.length == 0) {
          this.getTableType().then(tableType => {

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
  }

  async diskSummary () /*: Promise<Table_DiskSummary> */ {
    var sql = `
      SELECT
        pg_total_relation_size(c.oid) AS total_bytes,
        pg_indexes_size(c.oid) AS index_bytes,
        COALESCE(pg_total_relation_size(reltoastrelid), 0) AS toast_bytes,
        reltuples as estimate_count,
        relkind
      FROM pg_class C
      LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
      WHERE
        nspname = '${this.schema}' AND relname = '${this.table}'
    `;

    /*
      if (!result) {
        callback("error getting talbe info", '', '', error);
        return;
      }
    */

    var result = await this.q(sql);

    var row = result.rows[0];
    var type = row.relkind;

    row.table_bytes = row.total_bytes - row.index_bytes - row.toast_bytes;

    // TODO: dry
    // https://www.postgresql.org/docs/10/static/catalog-pg-class.html
    switch (row.relkind) {
      case "r": type = "table"; break;
      case "i": type = "index"; break;
      case "S": case "s": type = "sequence"; break;
      case "v": type = "view"; break;
      case "m": type = "materialized view"; break;
      case "c": type = "composite type"; break;
      case "t": type = "TOAST table"; break;
      case "f": type = "foreign table"; break;
      case "p": type = "partitioned table"; break;
    }

    return {
      type: type,
      estimateCount: row.estimate_count,
      diskUsage: {
        total: row.total_bytes,
        table: row.table_bytes,
        index: row.index_bytes,
        toast: row.toast_bytes
      }
    };
  }

  truncate (cascade) {
    var sql = `truncate table ${this.sqlTable()} ${cascade ? "CASCADE" : ""};`;
    return this.q(sql);
  }

  getConstraints () {
    var sql = `
      SELECT *, pg_get_constraintdef(oid, true) as pretty_source
      FROM pg_constraint WHERE conrelid = '${this.sqlTable()}'::regclass
    `;
    return this.q(sql);
  }

  async getRelations () {
    var sql = `
      SELECT
          kcu.column_name,
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage
              AS kcu ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage
              AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = '${this.schema}' AND tc.table_name = '${this.table}' AND constraint_type = 'FOREIGN KEY'
    `;

    var res = await this.q(sql);
    res.hash = {};
    res.rows.forEach(row => {
      res.hash[row.column_name] = row;
    });

    return res;
  }

  dropConstraint (constraintName, callback) {
    var sql = `ALTER TABLE ${this.sqlTable()} DROP CONSTRAINT ${constraintName};`;
    this.q(sql, (data, error) => {
      callback(data, error);
    });
  }

  sqlTable () {
    return `"${this.schema}"."${this.table}"`;
  }

  refreshMatView () {
    return this.q(`REFRESH MATERIALIZED VIEW ${this.sqlTable()}`);
  }

  updateValue (ctid, field, value, isNull) {
    var sql;
    if (isNull) {
      sql = `UPDATE ${this.sqlTable()} SET "${field}" = NULL WHERE ctid = '${ctid}';`;
    } else {
      sql = pgEscape(`UPDATE ${this.sqlTable()} SET "${field}" = %L WHERE ctid = '${ctid}';`, value);
    }

    return this.q(sql);
  }
}

Table.types = TABLE_TYPES;
Table.typeAliasess = TABLE_TYPE_ALIASES;

/*::
declare var Table__: typeof Table
*/

module.exports = Table;
