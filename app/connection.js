//process.env.PGSSLMODE = 'prefer';

// @ts-ignore
var pg = require('pg');
// @ts-ignore
const url = require('url');
// @ts-ignore
const semver = require('semver');
const colors = require('colors/safe');
colors.enabled = true;
const vsprintf = require("sprintf-js").vsprintf;

try {
  if (process.platform == "darwin" || process.platform == "linux") {
    // @ts-ignore
    var pg = pg.native;
  }
} catch (error) {
  console.log("can not load pg-native, using pg");
  console.error(error);
  //errorReporter(error);
}

class Connection {
  /*::
    className: string
    //defaultDatabaseName: string
    history: HistoryRecord[]
    logging: boolean
    printTestingError: boolean
    server: Model.Server // Model.Server
    connection: pg.ClientExt
    notificationCallbacks: Function[]
    _serverVersionFull: string
    _serverVersion: string
    connectString: string
    options: ConnectionOptions

    static PG: any
    public static instances: Connection[]
  */

  constructor() {
    this.className = 'Connection';
    this.history = []
    this.logging = true;
    this.printTestingError = true;
    this.server = new Model.Server(this);

    //this.options = options;
    this.connection = null;
    global.Connection.instances.push(this);
    this.notificationCallbacks = [];
  }

  static get defaultDatabaseName() {
    return 'template1';
  }

  static parseConnectionString(postgresUrl /*: string */) {
    var parsed = url.parse(postgresUrl);
    var auth = (parsed.auth || '').split(':');
    var dbname = !parsed.pathname || parsed.pathname == '/' ? this.defaultDatabaseName : parsed.pathname.replace(/^\//, '');

    return {
      user: auth[0],
      password: auth[1],
      host: parsed.hostname,
      port: parsed.port || '5432',
      database: dbname,
      query: parsed.query
    };
  }

  connectToServer(options /*: string | ConnectionOptions */, callback /*: (success: boolean, error?: Error) => void */) {
    if (typeof options == 'object' && options.url) {
      options = options.url;
    }

    if (typeof options == 'object' && !options.url) {
      // set defaults
      if (options.port == undefined) options.port = '5432';
      if (options.host == undefined) options.host = 'localhost';

      if (!options.database) options.database = Connection.defaultDatabaseName;

      var connectUser = options.user ? `${options.user}` : '';
      if (options.password) connectUser += `:${options.password}`;
      this.connectString = `postgres://${connectUser ? connectUser + '@' : ''}${options.host}:${options.port}/${options.database}`;

      if (options.query) {
        this.connectString += "?" + options.query;
      }
    } else if (typeof options == 'string') {
      this.connectString = options;
      options = Connection.parseConnectionString(this.connectString);
    }

    log.info('Connecting to', this.connectString);

    if (this.connection) {
      this.connection.end();
      delete this.connection; // = null;
    }

    this.options = options;

    this.connection = new pg.Client({connectionString: this.connectString}) /*:: as pg.ClientExt */;

    return this.connection.connect().then(res => {
      this.connection.on('notification', (msg) => {
        this.notificationCallbacks.forEach((fn) => {
          fn(msg);
        });
        App.log("notification.recieved", msg);
      });

      this.connection.on('error', (error) => {
        var dialog = electron.remote.dialog;
        var message = error.message.replace(/\n\s+/g, "\n") + "\nTo re-open connection, use File -> Reconnect";
        dialog.showErrorBox("Server Connection Error", message);
      });

      this.serverVersion().then(version => {
        if (this.logging) {
          console.log("Server version is", version);
        }
        callback && callback(true);
        Promise.resolve(true)
      });
      App.log("connect.success", this, JSON.parse(JSON.stringify(options)));
    }).catch(error => {
      callback && callback(false, error.message);
      App.log("connect.error", this, JSON.parse(JSON.stringify(options)), error);
    });
  }

  switchDb(database /*: string */, callback /*::? : (success: boolean, error?: Error) => void */) {
    this.options.database = database;
    return this.connectToServer(this.options, callback);
  }

  query(sql, callback /*: Function */) {
    if (this.logging) logger.print("SQL: " + colors.green(sql) + "\n");

    var historyRecord /*: HistoryRecord */ = { sql: sql, date: (new Date()), state: 'running', time: -1 };
    this.history.push(historyRecord);
    App.log("sql.start", historyRecord);
    var time = Date.now();

    return new Promise((resolve, reject) => {
      this.connection.query(sql, (error, result) => {
        historyRecord.time = Date.now() - time;
        if (this.logging) logger.print("SQL:" + colors.green(" Done ") + historyRecord.time + "\n");

        if (global.TESTING && this.printTestingError && error) {
          if (this.logging) logger.print("FAILED: " + colors.yellow(sql) + "\n");
          log.error(error);
        }

        if (error) {
          historyRecord.error = error;
          historyRecord.state = 'failed';
          App.log("sql.failed", historyRecord);
          // @ts-ignore
          error.query = sql;
          if (this.logging) {
            console.error("SQL failed", sql);
            console.error(error);
          }
          //if (query) query.state = 'error';
          if (callback) callback(result, error);
          this.onConnectionError(error);
          reject(error);
        } else {
          historyRecord.state = 'success';
          App.log("sql.success", historyRecord);
          // @ts-ignore
          result.time = historyRecord.time;
          //console.log(result);
          if (callback) callback(result);
          resolve(result);
        }
      });
    });
  }

  q(sql /*: string */, ...params /*: any[] */ ) {
    var callback = undefined;
    if (typeof params[params.length - 1] == 'function') {
      callback = params.pop();
    }

    return this.query(vsprintf(sql, params), callback);
  }

  serverVersion(callback /*:: ?: Function */) {
    if (this._serverVersion != undefined) {
      callback && callback(this._serverVersion, this._serverVersionFull);
      return Promise.resolve(this._serverVersion);
    }

    if (this.connection.native && this.connection.native.pq.serverVersion) {
      var intVersion = this.connection.native.pq.serverVersion();
      var majorVer = ~~ (intVersion / 10000);
      var minorVer = ~~ (intVersion % 10000 / 100);
      var patchVer = intVersion % 100;
      this._serverVersion = [majorVer, minorVer, patchVer].join(".");
      callback && callback(this._serverVersion);
      return Promise.resolve(this._serverVersion);
    }

    console.log("Client don't support serverVersion, getting it with sql");

    return this.server.fetchServerVersion().then(version => {
      this._serverVersion = version.split(" ")[1];
      if (this._serverVersion.match(/^\d+\.\d+$/)) {
        this._serverVersion += '.0';
      }
      this._serverVersionFull = version;
      callback && callback(this._serverVersion, this._serverVersionFull);
      return Promise.resolve(this._serverVersion);
    });
  }

  supportMatViews() {
    return semver.gt(this._serverVersion, "9.3.0");
  }

  tablesAndSchemas(callback /*: Function */) {
    var data = {};
    var sql = "SELECT * FROM information_schema.tables order by table_schema != 'public', table_name;";
    return this.query(sql, (rows) => {
      rows.rows.forEach((dbrow) => {
        if (!data[dbrow.table_schema]) data[dbrow.table_schema] = [];
        data[dbrow.table_schema].push(dbrow);
      });
      callback(data);
    });
  }

  mapViewsAsTables(callback /*: Function */) {
    if (!this.supportMatViews()) {
      callback([]);
      return;
    }

    var data = {};
    var sql = "select schemaname as table_schema, matviewname as table_name, 'MATERIALIZED VIEW' as table_type " +
              "from pg_matviews " +
              "order by schemaname != 'public', matviewname";

    return this.query(sql, (result, error) => {
      if (error) {
        log.error(error.message);
        callback([]);
        return;
      }
      result.rows.forEach((dbrow) => {
        if (!data[dbrow.table_schema]) data[dbrow.table_schema] = [];
        data[dbrow.table_schema].push(dbrow);
      });
      callback(data);
    });
  }

  tableSchemas(callback /*: Function */) {
    var sql = "SELECT table_schema FROM information_schema.tables GROUP BY table_schema " +
              "ORDER BY table_schema != 'public'";
    return this.query(sql, (rows) => {
      var data = rows.rows.map((dbrow) => {
        return dbrow.table_schema;
      });
      callback(data);
    })
  }

  getExtensions(callback /*: Function */) {
    // 'select * from pg_available_extensions order by (installed_version is null), name;'
    return this.q('select * from pg_available_extensions order by name;', (data) => {
      callback(data.rows);
    });
  }

  installExtension(extension /*: string */, callback /*: Function */) {
    return this.q('CREATE EXTENSION "%s"', extension, callback);
  }

  uninstallExtension(extension /*: string */, callback /*: Function */) {
    return this.q('DROP EXTENSION "%s"', extension, callback);
  }

  queryMultiple(queries /*: string[] */, callback /*: Function */) {
    var leftQueries = queries.slice();
    var conn = this;

    var lastResult;

    var runner = function () {
      if (leftQueries.length == 0) {
        callback(lastResult);
        return;
      }

      var sql = leftQueries.shift();
      conn.query(sql, (reuslt, error) => {
        if (error) {
          callback(reuslt, error);
        } else {
          lastResult = reuslt;
          runner();
        }
      });
    };

    runner();
  }

  dropUserFunctions(namespace /*: string */, callback /*: Function */) {
    if (typeof callback == 'undefined' && typeof namespace == 'function') {
      callback = namespace;
      namespace = undefined;
    }
    if (!namespace) namespace = 'public';

    var sql = "SELECT 'DROP ' || (CASE WHEN proisagg THEN 'AGGREGATE' ELSE 'FUNCTION' END) || " +
          "' IF EXISTS ' || ns.nspname || '.' || proname || '(' || oidvectortypes(proargtypes) || ');' as cmd " +
          "FROM pg_proc INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid) " +
          "WHERE ns.nspname = '%s'  order by proname;"

    this.q(sql, namespace, (result, error) => {
      if (error) {
        callback(result, error);
      } else {
        if (result.rows.length) {
          var dropSql = [];
          result.rows.forEach((row) => {
            dropSql.push(row.cmd);
          });
          this.queryMultiple(dropSql, callback);
        } else {
          callback(result);
        }
      }
    });
  }

  dropAllSequesnces(callback /*: Function */) {
    var sql = "SELECT 'drop sequence ' || c.relname || ';' as cmd FROM pg_class c WHERE (c.relkind = 'S');";

    this.q(sql, (result, error) => {
      if (error) {
        callback(result, error);
      } else {
        if (result.rows.length) {
          var dropSql = [];
          result.rows.forEach((row) => {
            dropSql.push(row.cmd);
          });
          this.queryMultiple(dropSql, callback);
        } else {
          callback(result);
        }
      }
    });
  }

  close(callback /*:: ?: Function */) {
    if (this.connection) {
      this.connection.end();
    }
    var index = global.Connection.instances.indexOf(this);
    if (index != -1) {
      global.Connection.instances.splice(index, 1);
    }
    callback && callback();
  }

  reconnect(callback /*: (success: boolean, error?: Error) => void */) {
    this.close(() => {
      this.connectToServer(this.options, callback);
    });
  }

  onNotification(callback /*: Function */) {
    this.notificationCallbacks.push(callback);
  }

  onConnectionError(error /*: Error */) {
    if (
      error.message.indexOf("server closed the connection unexpectedly") != -1 ||
      error.message.indexOf("Unable to set non-blocking to true") != -1) {

      console.error(error);

      window.alertify.confirm("Seems like disconnected, reconnect?<br><small>" + error.message, (is_yes) => {
        window.alertify.hide();
        if (is_yes) {
          var tab = global.App.tabs.filter((tab) => {
            return tab.instance.connection == this;
          })[0];

          if (tab) tab.instance.reconnect();
        }
      });
    }
  }

  hasRunningQuery () {
    if (this.connection.native) {
      return !!this.connection._activeQuery;
    } else {
      return this.connection.activeQuery;
    }
  }

  stopRunningQuery() {
    var query;
    if (this.connection.native) {
      query = this.connection._activeQuery;
      if (query) {
        try {
          query.native.cancel((error) => {
            if (this.logging) {
              console.log('canceled', error);
            }
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        console.log('no running query');
      }
    } else {
      query = this.connection.activeQuery;
      if (query) {
        var otherConn = new pg.Client({connectionString: this.connectString});
        otherConn.connect((error) => {
          if (error) {
            console.log(error);
            return;
          }

          console.log("Stopping query via sql. PID:", this.connection.processID);
          var sql = `select pg_cancel_backend(${this.connection.processID})`;
          otherConn.query(sql).then(res => {
            otherConn.end();
          }).catch(err => {
            console.error(err);
            otherConn.end();
          });
        });
      } else {
        console.log('no running query');
      }
    }
  }
}

global.Connection = Connection;

global.Connection.PG = pg;
global.Connection.instances = [];
