process.env.PGSSLMODE = 'prefer';

var pg = require('pg');
var anyDB = require('any-db');
var sprintf = require("sprintf-js").sprintf,
    vsprintf = require("sprintf-js").vsprintf;

global.Connection = jClass.extend({
  className: 'Connection',
  defaultDatabaseName: 'template1',
  history: [],
  logging: true,

  init: function(options, callback) {
    this.options = options;
    this.connection = null;
    global.Connection.instances.push(this);
    this.connectToServer(options, callback);
  },

  connectToServer: function (options, callback) {
    var connectString;

    if (typeof options == 'object') {
      // set defaults
      if (options.port == undefined) options.port = '5432';
      if (options.host == undefined) options.host = 'localhost';

      var database = options.database || this.defaultDatabaseName;
      var connectString = 'postgres://' + options.user + ':' + 
        options.password + '@' + options.host + ':' + 
        options.port + '/' + database;
    } else {
      connectString = options;
    }

    log.info('Connecting to', connectString);

    this.connection = anyDB.createConnection(connectString, function (error) {
      if (error) {
        console.log(error);
        callback && callback(false, error.message);
      } else {
        callback && callback(true);
      }
    });
  },

  switchDb: function(database, callback) {
    this.options.database = database;
    this.connectToServer(this.options, callback);
  },

  query: function (sql, callback) {
    if (this.logging) process.stdout.write("SQL: " + sql.green + "\n");
    var historyRecord = {
      sql: sql,
      date: (new Date())
    };

    this.history.push(historyRecord);
    var time = Date.now();
    this.connection.query(sql, function (error, result) {
      historyRecord.time = Date.now() - time;
      if (error) {
        historyRecord.error = error;
        console.error("SQL failed", sql);
        console.error(error);
        if (callback) callback(result, error);
      } else {
        result.time = historyRecord.time;
        //console.log(result);
        if (callback) callback(result);
      }
    });
  },

  q: function(sql) {
    var params = [], i;
    var callback = arguments[arguments.length - 1];
    for (i = 1; i < arguments.length - 1; i++) params.push(arguments[i]);

    this.query(vsprintf(sql, params), callback);
  },

  listDatabases: function (callback) {
    var databases = [];
    this.query('SELECT datname FROM pg_database WHERE datistemplate = false;', function (rows) {
      rows.rows.forEach(function(dbrow) {
        databases.push(dbrow.datname);
      });
      callback(databases);
    });
  },

  databaseTemplatesList: function (callback) {
    var databases = [];
    this.query('SELECT datname FROM pg_database WHERE datistemplate = true;', function (rows) {
      rows.rows.forEach(function(dbrow) {
        databases.push(dbrow.datname);
      });
      callback(databases);
    });
  },

  avaliableEncodings: function (callback) {
    var encodings = [];
    this.query('select pg_encoding_to_char(i) as encoding from generate_series(0,100) i', function(rows) {
      rows.rows.forEach(function(dbrow) {
        if (dbrow.encoding != '') encodings.push(dbrow.encoding);
      });
      callback(encodings);
    });
  },

  getVariable: function(variable, callback) {
    this.q('show %s', variable, function (data, error) {
      var vname = Object.keys(data.rows[0])[0];
      callback(data.rows[0][vname]);
    });
  },

  publicTables: function(callback) {
    this.query("SELECT * FROM information_schema.tables where table_schema = 'public';", function(rows, error) {
      callback(rows.rows, error);
    });
  },

  tablesAndSchemas: function(callback) {
    var data = {};
    this.query("SELECT * FROM information_schema.tables order by table_schema != 'public';", function(rows) {
      rows.rows.forEach(function(dbrow) {
        if (!data[dbrow.table_schema]) data[dbrow.table_schema] = [];
        data[dbrow.table_schema].push(dbrow);
      });
      callback(data);
    });
  },

  tableSchemas: function (callback) {
    var sql = "select table_schema from information_schema.tables group by table_schema " +
              "order by table_schema != 'public'";
    this.query(sql, function (rows) {
      var data = rows.rows.map(function(dbrow) {
        return dbrow.table_schema;
      });
      callback(data);
    })
  },

  getExtensions: function(callback) {
    // 'select * from pg_available_extensions order by (installed_version is null), name;'
    this.q('select * from pg_available_extensions order by name;', function(data) {
      callback(data.rows);
    });
  },

  getTableContent: function (schema, table, callback) {
    this.q('select * from "%s"."%s" limit 100', schema, table, function(data) {
      callback(data);
    });
  },

  getUsers: function(callback) {
    sql = (function () { /*

    SELECT r.rolname, r.rolsuper, r.rolinherit,
      r.rolcreaterole, r.rolcreatedb, r.rolcanlogin,
      r.rolconnlimit, r.rolvaliduntil,
      ARRAY(SELECT b.rolname
            FROM pg_catalog.pg_auth_members m
            JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
            WHERE m.member = r.oid) as memberof
    , r.rolreplication
    FROM pg_catalog.pg_roles r
    ORDER BY 1;

    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    this.q(sql, function(data) {
      callback(data.rows);
    });
  },

  createUser: function (data, callback) {
    var sql = sprintf('CREATE USER "%s"', data.username);

    if (data.password) sql += sprintf(" WITH PASSWORD '%s'", data.password);
    sql += ';'
    if (data.superuser) sql += sprintf('ALTER USER "%s" WITH SUPERUSER;', data.username);

    this.q(sql, function(data, error) {
      callback(data, error);
    });
  },

  deleteUser: function (username, callback) {
    this.q('DROP USER "%s"', username, callback);
  },

  installExtension: function (extension, callback) {
    this.q('CREATE EXTENSION "%s"', extension, callback);
  },

  uninstallExtension: function (extension, callback) {
    this.q('DROP EXTENSION "%s"', extension, callback);
  },

  createDatabase: function(dbname, template, encoding, callback) {
    var sql = "CREATE DATABASE %s";
    if (encoding) sql += " ENCODING '" + encoding + "'";
    if (template) sql += " TEMPLATE " + template;
    this.q(sql, dbname, callback);
  }
});

global.Connection.instances = [];