class Index extends ModelBase {
  /*::
  table: Model.Table
  name: string
  pg_get_indexdef: string
  index_size: string
  */
  constructor (name, table, data = {} /*:: as any */) {
    if (name) {
      data.relname = data.name = name;
    }
    super(data);
    this.table = table;
  }

  static async list(table) {
    var sql_find_oid = `
      SELECT c.oid,
        n.nspname,
        c.relname
      FROM pg_catalog.pg_class c
           LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = '${table.schema}' and c.relname = '${table.table}'
      ORDER BY 2, 3;`;

    var sql_find_index = `
      SELECT
          c2.relname, i.indisprimary, i.indisunique, i.indisclustered, i.indisvalid,
          pg_catalog.pg_get_indexdef(i.indexrelid, 0, true),
          pg_catalog.pg_get_constraintdef(con.oid, true), contype,
          condeferrable, condeferred, c2.reltablespace, i.indisvalid,
          pg_size_pretty(pg_relation_size(c2.oid)) as index_size
      FROM pg_catalog.pg_class c, pg_catalog.pg_class c2, pg_catalog.pg_index i
        LEFT JOIN pg_catalog.pg_constraint con ON (conrelid = i.indrelid AND conindid = i.indexrelid AND contype IN ('p','u','x'))
      WHERE c.oid = '%d' AND c.oid = i.indrelid AND i.indexrelid = c2.oid
      ORDER BY i.indisprimary DESC, i.indisunique DESC, c2.relname;`;

    var oid_data = await this.q(sql_find_oid);

    if (!oid_data || !oid_data.rows || !oid_data.rows[0]) {
      throw new Error(`Relation ${table.sqlTable()} does not exist`);
    }

    var oid = oid_data.rows[0].oid;
    var indexes_rows = await this.q(sql_find_index, oid);

    return indexes_rows.rows.map(idx => {
      idx.name = idx.relname;
      return new Index(idx.name, table, idx);
    });

    //return indexes_rows.rows;
  }

  static async create (table, name, options = {} /*:: as any */) {
    options = Object.assign({
      uniq: false,
      columns: [],
      method: 'btree'
    }, options);

    var columns_sql = Array.isArray(options.columns) ?
      options.columns.map(col => { return `"${col}"` }).join(', ') :
      `"${options.columns.toString()}"`;

    if (name && name != '') {
      name = `"${name}"`;
    } else {
      name = '';
    }

    var sql = `CREATE ${options.uniq ? 'UNIQUE' : ''} INDEX CONCURRENTLY
      ${name} ON ${table.sqlTable()} USING ${options.method} (${columns_sql});`;

    return this.q(sql);
  }

  async drop () {
    return this.q(`DROP INDEX CONCURRENTLY "${this.name}";`);
  }

  columns () {
    var str = this.pg_get_indexdef.match(/ON [^(]+\((.+)\)/)[1];
    return str.split(/,\s+/).map(col => { return col.replace(/^"(.+)"$/, '$1'); });
  }
}

['name', 'relname', 'indisprimary', 'indisunique', 'indisvalid', 'pg_get_indexdef', 'pg_get_constraintdef', 'index_size'].forEach(field => {
  Object.defineProperty(Index.prototype, field, {
    get: function () {
      return this.data[field];
    },

    set: function (value) {
      if (this.data[field] != value) {
        this.changes = this.changes || {};
        this.changes[field] = [this.data[field], value];
        this.data[field] = value;
      }
      return this.data[field];
    }
  });
});

/*::
declare var Index__: typeof Index
*/

module.exports = Index;
