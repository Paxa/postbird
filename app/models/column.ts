class Column extends ModelBase {

  
  declare default_value: string
  declare changes: any
  declare table: Model.Table
  declare name: string
  declare max_length: string | number
  declare type: string
  declare allow_null: boolean
  declare attributes: any
  declare static attributesAliases: any
  

  constructor (name, data  ?: any ) {
    if (typeof name == 'object') {
      super({});
      Object.keys(name).forEach((attr) => {
        this[attr] = name[attr];
      });

      // set defaults
      if (this.default_value === undefined) {
        this.default_value = null;
      }

      // reset changes on initialization
      this.changes = {};

    } else {

      if (data.character_maximum_length == null) {
        if (typeof data.numeric_precision == 'number') {
          if (data.numeric_scale) {
            data.character_maximum_length = `${data.numeric_precision},${data.numeric_scale}`;
          } else {
            data.character_maximum_length = `${data.numeric_precision}`;
          }
        } else if (typeof data.datetime_precision == 'number' && data.atttypmod != -1) {
          data.character_maximum_length = `${data.datetime_precision}`;
        }
      }

      super(data);
      if (data.table) {
        this.table = data.table;
      }
      this.name = name;
    }
    //this.is_primary_key = this. //
  }

  static async create(data) {
    var column = new Column(data);
    return await column.create();
  }

  async create() {
    this.shouldHaveTable();

    var type_with_length = this.max_length ? `${this.type}(${this.max_length})` : this.type;
    var null_sql = this.allow_null ? "NULL" : "NOT NULL";
    var default_sql = this._default_sql(this.default_value);

    var sql = `ALTER TABLE ${this.table.sqlTable()} ADD "${this.name}" ${type_with_length} ${default_sql} ${null_sql};`;

    await this.q(sql);

    return this;
  }

  async update(formData) {
    var allValid = true;

    for (var attr in formData) {
      try {
        this[attr] = formData[attr];
      } catch (error) {
        console.error(error);
        allValid = false;
      }
    }

    if (allValid) {
      await this.save();
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  async save() {
    this.shouldHaveTable();

    if (!this.changes || Object.keys(this.changes).length == 0) {
      return;
    }

    await this.save_renameColumn();
    await this.save_alterType();
    await this.save_alterNullable();
    await this.save_alterDefault();
    delete this.changes;
  }

  async save_renameColumn () {
    if (this.changes['name']) {
      var oldName = this.changes['name'][0];
      var newName = this.changes['name'][1];

      var res = await this.q(`ALTER TABLE ${this.table.sqlTable()} RENAME COLUMN "${oldName}" TO "${newName}"`);
      delete this.changes['name'];
      return res;
    }
  }

  // TODO: http://www.postgresql.org/docs/9.1/static/sql-altertable.html
  async save_alterType () {
    if (this.changes['type'] || this.changes['max_length']) {
      this.shouldHaveTable();

      var type_with_length = this.max_length ? this.type + "(" + this.max_length + ")" : this.type;
      var sql = `ALTER TABLE ${this.table.sqlTable()} ALTER COLUMN "${this.name}" TYPE ${type_with_length} USING "${this.name}"::${this.type};`;

      var res = await this.q(sql);
      delete this.changes['type'];
      delete this.changes['max_length'];
      return res;
    }
  }

  async save_alterNullable () {
    if (this.changes['allow_null']) {
      var null_sql = this.allow_null ? "DROP NOT NULL" : "SET NOT NULL";
      var sql = `ALTER TABLE ${this.table.sqlTable()} ALTER COLUMN "${this.name}" ${null_sql};`;
      return await this.q(sql);
    }
  }

  async save_alterDefault () {
    if (this.changes['default_value']) {
      if (this.default_value == undefined || this.default_value == '') {
        return await this.q(`ALTER TABLE ${this.table.sqlTable()} ALTER COLUMN "${this.name}" DROP DEFAULT;`);
      } else {
        return await this.q(`ALTER TABLE ${this.table.sqlTable()} ALTER COLUMN "${this.name}" SET ${this._default_sql(this.default_value)};`);
      }
    }
  }

  async drop () {
    this.shouldHaveTable();
    await this.q(`ALTER TABLE ${this.table.sqlTable()} DROP COLUMN "${this.name}"`);
  }

  shouldHaveTable () {
    if (!this.table) {
      throw new Error("Column should be attached to table. column.table property should be set.");
    }
  }

  _default_sql (default_value) {
    if (default_value !== undefined && default_value !== '') {
      return 'DEFAULT ' + JSON.stringify(default_value).replace(/^"/, "'").replace(/"$/, "'")
    } else {
      return '';
    }
  }

  static get fallbackTypes() {
    return [
      { schema: 'pg_catalog', name: 'integer', udt_name: 'int4', description: 'signed four-byte integer' },
      { schema: 'pg_catalog', name: 'bigint', udt_name: 'int8', description: 'signed eight-byte integer' },
      { schema: 'pg_catalog', name: 'smallint', udt_name: 'int2', description: 'signed two-byte integer' },
      { schema: 'pg_catalog', name: 'numeric', udt_name: 'numeric', description: 'exact numeric of selectable precision' },
      { schema: 'pg_catalog', name: 'decimal', udt_name: 'numeric', description: 'exact numeric of selectable precision' },
      { schema: 'pg_catalog', name: 'real', udt_name: 'float4', description: 'single precision floating-point number' },
      { schema: 'pg_catalog', name: 'double precision', udt_name: 'float8', description: 'double precision floating-point number' },
      { schema: 'pg_catalog', name: 'serial', udt_name: 'int4', description: 'autoincrementing four-byte integer' },
      { schema: 'pg_catalog', name: 'bigserial', udt_name: 'int8', description: 'autoincrementing eight-byte integer' },
      { schema: 'pg_catalog', name: 'text', udt_name: 'text', description: 'variable-length character string' },
      { schema: 'pg_catalog', name: 'character varying', udt_name: 'varchar', description: 'variable-length character string' },
      { schema: 'pg_catalog', name: 'character', udt_name: 'bpchar', description: 'fixed-length character string' },
      { schema: 'pg_catalog', name: 'boolean', udt_name: 'bool', description: 'state of true or false' },
      { schema: 'pg_catalog', name: 'timestamp without time zone', udt_name: 'timestamp', description: 'date and time (no time zone)' },
      { schema: 'pg_catalog', name: 'timestamp with time zone', udt_name: 'timestamptz', description: 'date and time, including time zone' },
      { schema: 'pg_catalog', name: 'date', udt_name: 'date', description: 'calendar date (year, month, day)' },
      { schema: 'pg_catalog', name: 'time without time zone', udt_name: 'time', description: 'time of day (no time zone)' },
      { schema: 'pg_catalog', name: 'time with time zone', udt_name: 'timetz', description: 'time of day, including time zone' },
      { schema: 'pg_catalog', name: 'json', udt_name: 'json', description: 'textual JSON data' },
      { schema: 'pg_catalog', name: 'jsonb', udt_name: 'jsonb', description: 'binary JSON data, decomposed' },
      { schema: 'pg_catalog', name: 'uuid', udt_name: 'uuid', description: 'universally unique identifier' },
      { schema: 'pg_catalog', name: 'bytea', udt_name: 'bytea', description: 'variable length binary string' },
      { schema: 'pg_catalog', name: 'inet', udt_name: 'inet', description: 'IPv4 or IPv6 host address' },
      { schema: 'pg_catalog', name: 'cidr', udt_name: 'cidr', description: 'IPv4 or IPv6 network address' },
      { schema: 'pg_catalog', name: 'macaddr', udt_name: 'macaddr', description: 'MAC address' },
      { schema: 'pg_catalog', name: 'interval', udt_name: 'interval', description: 'time interval' }
    ];
  }

  static availableTypes (callback?: any) {
    var sql = `
      SELECT n.nspname as "schema",
        pg_catalog.format_type(t.oid, NULL) AS "name",
        pg_catalog.obj_description(t.oid, 'pg_type') as "description",
        t.typname as udt_name
      FROM pg_catalog.pg_type t
           LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid))
        AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
        AND pg_catalog.pg_type_is_visible(t.oid)
      ORDER BY 1, 2;
    `.trim();

    return this.q(sql).then(data => {
      var rows = (data && data.rows && data.rows.length) ? data.rows : Column.fallbackTypes;
      callback && callback(rows);
      return Promise.resolve(rows);
    }).catch(err => {
      console.warn("Could not load catalog types, using fallback SQL types (#149):", err);
      callback && callback(Column.fallbackTypes);
      return Promise.resolve(Column.fallbackTypes);
    });
  }
}

Column.attributesAliases = {
  name: 'column_name',
  type: 'data_type',
  default_value: 'column_default',
  max_length: 'character_maximum_length'
};

Object.keys(Column.attributesAliases).forEach((attr) => {
  var data_attr = Column.attributesAliases[attr];
  Object.defineProperty(Column.prototype, attr, {
    get: function () {
      return this.data[data_attr];
    },

    set: function (value) {
      if (attr == 'max_length') {
        if (typeof value == 'string') {
          value = value.trim()
          if (!value.match(/^[\d,]*$/)) {
            $u.alert("Max Length has invalid format: only numbers and comma allowed");
            throw new Error("Max Length has invalid format: only numbers and comma allowed")
          }
        } else if (isNaN(value)) {
          value = null;
        }
      }

      if (this.data[data_attr] != value) {
        this.changes = this.changes || {};
        this.changes[attr] = [this.data[data_attr], value];
        this.data[data_attr] = value;
      }
      return this.data[data_attr];
    }
  });
});

// accept and return true/false
// handle inside "YES" and "FALSE"

Object.defineProperty(Column.prototype, "allow_null", {
  get: function () {
    return (this.data.is_nullable == 'YES');
  },

  set: function (value) {
    // convert pseudo true (1, "1", "true") => true
    value = [true, "true", 1, "1", "yes"].indexOf(value) != -1;
    var newValue = value ? "YES" : "NO";
    if (newValue != this.data.is_nullable) {
      this.changes = this.changes || {};
      this.changes['allow_null'] = [this.allow_null, value];
      this.data.is_nullable = newValue;
    }

    return this.data.is_nullable == "YES";
  }
});

Object.defineProperty(Column.prototype, "attributes", {
  get: function () {
    return {
      name: this.name,
      type: this.type,
      default_value: this.default_value,
      max_length: this.max_length,
      allow_null: this.allow_null
    };
  }
});


declare var Column__: typeof Column


module.exports = Column;
