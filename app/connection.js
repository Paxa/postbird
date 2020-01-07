//process.env.PGSSLMODE = 'prefer';

// @ts-ignore
var pg = require('pg');
var url = require('url');
var semver = require('semver');
var colors = require('colors/safe');
colors.enabled = true;
var vsprintf = require("sprintf-js").vsprintf;
var ConnectionString = require('connection-string').ConnectionString;


// Change postgres' type parser to use moment instance instead of js Date instance
// because momentjs object has timezone information as in original string (js Date object always use local timezone)
var types = require('pg').types;
var moment = require('moment')

var TIMESTAMPTZ_OID = 1184
var TIMESTAMP_OID = 1114
var customDateParser = (val) => {
  if (val === null) {
    return null;
  } else {
    var date = moment.parseZone(val)
    date.origValueString = val
    return date
  }
};

types.setTypeParser(TIMESTAMPTZ_OID, customDateParser)
types.setTypeParser(TIMESTAMP_OID, customDateParser)

var usingNativeLib = false;
// Disable loading pg-native until issue with openssl paths is solved
/*
try {
  if (process.platform == "darwin" || process.platform == "linux") {
    if (pg.native) {
      // @ts-ignore
      pg = pg.native;
      usingNativeLib = true;
    }
  }
} catch (error) {
  console.log("can not load pg-native, using pg");
  console.error(error);
  //errorReporter(error);
}
*/


/*::
interface FieldDef {
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
}

interface QueryResultBase {
    command: string;
    rowCount: number;
    oid: number;
    fields: FieldDef[];
}

interface QueryResult extends QueryResultBase {
    rows: any[];
}
*/

class Connection {
  /*::
    className: string
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
    startQuery: string
    isCockroach: boolean
    onDisconnect?: Function

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

  // Use ConnectionString lib to support parsing unix socket in connection string
  static parseConnectionString(postgresUrl /*: string */) /*: ConnectionOptions */ {
    var cs = new ConnectionString(postgresUrl);
    if (!cs.params) cs.params = {};
    if (!cs.params.application_name) cs.params.application_name = 'Postbird.app';

    var res = Object.assign({}, cs.params, {
      host: cs.hostname,
      port: cs.port || cs.params && cs.params && cs.params.socketPort || '5432',
      database: cs.path && cs.path[0],
      user: cs.user,
      password: cs.password,
    });
    if (cs.params && 'ssl' in cs.params) {
      res.ssl = Boolean(cs.params.ssl)
    }
    delete res.socketPort;

    return res;
  }

  // Use ConnectionString lib to support parsing unix socket in connection string
  static generateConnectionString(options) {
    if (options.port == undefined) options.port = '5432';
    if (options.host == undefined) options.host = 'localhost';
    if (!options.database) options.database = Connection.defaultDatabaseName;

    var socketPort = null;

    var host = options.host
    if (host.startsWith('/')) {
      host = {
        type: "socket",
        name: host,
        port: options.port
      };
      if (`${options.port}` != '5432') {
        socketPort = options.port;
      }
    } else {
      host = ConnectionString.parseHost(`${host}${options.port ? ':' + options.port : ''}`);
    }

    const cs = new ConnectionString('postgres://');
    cs.setDefaults({
      hosts: [host],
      path: [options.database],
      user: options.user,
      password: options.password,
    });
    cs.params = {};
    if (socketPort) {
      cs.params.socketPort = socketPort
    }
    if (options.ssl) {
      cs.params.ssl = true;
    }
    return cs.toString();
  }

  connectToServer(options /*: string | ConnectionOptions */, callback /*: (success: boolean, error?: Error) => void */) {
    if (typeof options == 'object' && options.url) {
      options = options.url;
    }

    if (typeof options == 'object' && !options.url) {
      if (options.sql_query) {
        this.startQuery = options.sql_query;
      }
      // set defaults
      this.connectString = Connection.generateConnectionString(options);
    } else if (typeof options == 'string') {
      this.connectString = options;
      options = Connection.parseConnectionString(this.connectString);
    }

    if (usingNativeLib) {
      this.connectString = this.connectString.replace(/(\?|&)ssl=1/, '$1ssl=verify-full');
    } else {
      this.connectString = this.connectString.replace(/(\?|&)ssl=verify-full/, '$1ssl=1');
    }

    logger.info('Connecting to', this.connectString);

    if (this.connection) {
      this.connection.end();
      delete this.connection; // = null;
    }

    this.options = options;

    this.connection = this._initConnection(this.connectString);

    return this.connection.connect().then(() => {
      this.connection.on('notification', (msg) => {
        this.notificationCallbacks.forEach((fn) => {
          fn(msg);
        });
        App.log("notification.recieved", msg);
      });

      this.connection.on('error', (e) => { this.onConnectionLost(e) });

      this.serverVersion().then(version => {
        if (this.logging) {
          console.log("Server version is", version);
        }
        if (this.startQuery) {
          this.query(this.startQuery, (res, error) => {
            if (error) {
              var formattedError = new Error(`Start query: ${this.startQuery}\n\nError: ${error.message}${error.hint ? "\n----\n" + error.hint : ''}`);
              callback && callback(false, formattedError);
              Promise.reject(error);
            } else {
              callback && callback(true);
              Promise.resolve(true);
            }
          });
        } else {
          callback && callback(true);
          Promise.resolve(true);
        }
      });
      App.log("connect.success", JSON.parse(JSON.stringify(options)));
    }).catch(error => {
      callback && callback(false, error);
      App.log("connect.error", this, JSON.parse(JSON.stringify(options)), error);
    });
  }

  _initConnection(connectString) /*: pg.ClientExt */ {
    // @ts-ignore
    var clientConfig = Connection.parseConnectionString(connectString) /*:: as pg.ClientConfig */;
    return new pg.Client(clientConfig) /*:: as pg.ClientExt */;
  }

  onConnectionLost(error) {
    if (this.onDisconnect) {
      this.onDisconnect(error);
    } else {
      var dialog = electron.remote.dialog;
      var message = error.message.replace(/\n\s+/g, "\n") + "\nTo re-open connection, use File -> Reconnect";
      dialog.showErrorBox("Server Connection Error", message);
    }
  }

  switchDb(database /*: string */, callback /*::? : (success: boolean, error?: Error) => void */) {
    this.options.database = database;
    return this.connectToServer(this.options, callback);
  }

  query(sql, callback /*:: ?: Function */) /*: Promise<QueryResult> */ {
    return this.queryWithOptions(sql, {}, callback);
  }

  queryWithOptions(sql, options, callback /*: Function */) /*: Promise<QueryResult> */ {
    options.text = sql;
    if (this.logging) logger.print("SQL: " + colors.green(sql) + "\n");

    var historyRecord /*: HistoryRecord */ = { sql: sql, date: (new Date()), state: 'running', time: -1 };
    this.history.push(historyRecord);
    App.log("sql.start", historyRecord);
    var time = Date.now();
    var startStack = new Error().stack;

    return new Promise((resolve, reject) => {
      this.connection.query(options, (error, result) => {
        historyRecord.time = Date.now() - time;
        if (this.logging) logger.print("SQL:" + colors.green(" Done ") + historyRecord.time + "\n");

        if (global.TESTING && this.printTestingError && error) {
          if (this.logging) logger.print("FAILED: " + colors.yellow(sql) + "\n");
          logger.error(error);
        }

        if (error) {
          error.stack = error.stack + "\n" + startStack.substring(startStack.indexOf("\n") + 1);
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

  q(sql /*: string */, ...params /*: any[] */ ) /*: Promise<QueryResult> */ {
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

    var cockroachPort = parseInt(this.options.port) > 26000;

    if (this.connection.native && this.connection.native.pq.serverVersion && !cockroachPort) {
      var intVersion = this.connection.native.pq.serverVersion();
      var majorVer = ~~ (intVersion / 10000);
      var minorVer = ~~ (intVersion % 10000 / 100);
      var patchVer = intVersion % 100;
      this._serverVersion = [majorVer, minorVer, patchVer].join(".");

      // convert "10.4," to 10.4
      if (this._serverVersion.match(/,$/)) {
        this._serverVersion = this._serverVersion.replace(/,$/, '');
      }

      // convert 11.1 to 11.1.0
      if (this._serverVersion.match(/^\d+\.\d+$/)) {
        this._serverVersion += '.0'
      }

      callback && callback(this._serverVersion);
      return Promise.resolve(this._serverVersion);
    }

    console.log("Client don't support serverVersion, getting it with sql");

    return this.server.fetchServerVersion().then(version => {
      if (version.match(/CockroachDB/i)) {
        this.isCockroach = true;
        this._serverVersion = '9.5.0';
      } else {
        this._serverVersion = version.split(" ")[1];
      }

      // convert "10.4," to 10.4,
      if (this._serverVersion.match(/,$/)) {
        this._serverVersion = this._serverVersion.replace(/,$/, '');
      }

      // convert 11.1 to 11.1.0
      if (this._serverVersion.match(/^\d+\.\d+$/)) {
        this._serverVersion += '.0';
      }

      this._serverVersionFull = version;
      callback && callback(this._serverVersion, this._serverVersionFull);
      return Promise.resolve(this._serverVersion);
    });
  }

  supportMatViews() {
    return !this.isCockroach && semver.gt(this._serverVersion, "9.3.0");
  }

  supportPgCollation() {
    return !this.isCockroach && semver.gte(this._serverVersion, "9.3.0");
  }

  supportPgIndexIndisvalid() {
    return semver.gte(this._serverVersion, "8.2.0");
  }

  supportPgRelationSize() {
    return !this.isCockroach && semver.gte(this._serverVersion, "8.1.0");
  }

  supportVectorAsArray() {
    return semver.gte(this._serverVersion, "8.1.0");
  }

  supportColMaxLength() {
    return !this.isCockroach;
  }

  supportColDefault() {
    return !this.isCockroach;
  }

  supportCtid() {
    return !this.isCockroach;
  }

  supportClassRelhasoids() {
    return this.isCockroach || semver.lt(this._serverVersion, "12.0.0");
  }

  tablesAndSchemas() {
    var data = {};
    var sql = "SELECT * FROM information_schema.tables order by table_schema != 'public', table_name;";
    return this.query(sql).then(rows => {
      rows.rows.forEach(dbrow => {
        if (!data[dbrow.table_schema]) data[dbrow.table_schema] = [];

        if (Model.Table.typeAliasess[dbrow.table_type]) {
          dbrow.table_type = Model.Table.typeAliasess[dbrow.table_type];
        }

        data[dbrow.table_schema].push(dbrow);
      });
      return data;
    });
  }

  async findSequences(schema /*:: ?: string */, table /*:: ?: string */) {
    var where = schema && table ? `AND ns.nspname = '${schema}' AND seq.relname = '${table}'` : '';
    var sql = `
      select ns.nspname as table_schema, seq.relname as table_name, 'SEQUENCE' as table_type,
        tab.relname as dep_table, attr.attname as dep_column, pg_get_expr(adbin, adrelid) as dep_def_value
      from pg_class as seq
      join pg_namespace as ns on (ns.oid = seq.relnamespace)
      left join pg_depend as dep on (seq.oid = dep.objid and deptype != 'n')
      left join pg_class as tab on (dep.refobjid = tab.oid)
      left join pg_attribute as attr on (attr.attnum = dep.refobjsubid and attr.attrelid = dep.refobjid)
      left join pg_attrdef as attrdef on (attrdef.adrelid = tab.oid and attrdef.adnum = attr.attnum)
      where seq.relkind = 'S' ${where}
      order by table_schema, table_name;
    `;

    return await this.query(sql);
  }

  async findNonSerialSequences() {
    var allSequences = await this.findSequences();
    var data = {};
    for (let row of allSequences.rows) {
      if (this.isSeqIndependent(row)) {
        if (!data[row.table_schema]) data[row.table_schema] = [];
        data[row.table_schema].push(row);
      }
    };

    return data;
  }

  isSeqIndependent(sequence) {
    if (!sequence.dep_def_value) {
      return true;
    } else {
      var expect = new RegExp(`^nextval\\(('${sequence.table_schema}'\.)?'${sequence.table_name}.+\\)`);
      return !sequence.dep_def_value.match(expect);
    }
  }

  mapViewsAsTables() {
    if (!this.supportMatViews()) {
      return Promise.resolve([]);
    }

    var data = {};
    var sql = "select schemaname as table_schema, matviewname as table_name, 'MATERIALIZED VIEW' as table_type " +
              "from pg_matviews " +
              "order by schemaname != 'public', matviewname";

    return this.query(sql).then(result => {
      result.rows.forEach((dbrow) => {
        if (!data[dbrow.table_schema]) data[dbrow.table_schema] = [];
        data[dbrow.table_schema].push(dbrow);
      });
      return data;
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

  getExtensions() /*: Promise<any> */ {
    return this.q('select * from pg_available_extensions order by name;');
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
      error.message.includes("server closed the connection unexpectedly") ||
      error.message.includes("Unable to set non-blocking to true") ||
      error.message.includes("Client has encountered a connection error and is not queryable") ||
      error.message.includes("Connection terminated")
    ) {

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
        var otherConn = this._initConnection(this.connectString);
        otherConn.connect((error) => {
          if (error) {
            console.log(error);
            return;
          }

          console.log("Stopping query via sql. PID:", this.connection.processID);
          var sql = `select pg_cancel_backend(${this.connection.processID})`;
          otherConn.query(sql).then(() => {
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
