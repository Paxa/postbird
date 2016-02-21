global.electron = require('electron');
var topProcess = electron.remote ? electron.remote.process : process;

process.on("uncaughtException", function(err) {
  topProcess.stdout.write(err.message);
  topProcess.stdout.write(err.stack);
});

if (!global.window) global.window = {};

global.TESTING = true;

require('../sugar/redscript-loader');

require('classy/object_extras').extendGlobal();
require('../lib/jquery.class');
require('../lib/node_lib');
require('../lib/arg');
require('../lib/sql_splitter');

require('../app/connection');
require("../app/models/base");
require("../app/models/table");
require("../app/models/column");
require("../app/models/index");
require("../app/models/procedure");

require("../lib/psql_runner");
require("../lib/sql_importer");
require("../lib/pg_dump_runner");
require("../lib/sql_exporter");

require('../app');

require('../sugar/redscript-loader');

global.$u = {fn: {}};
require('../app/utils');

logger.info(typeof Object.forEach);

App.tabs = [{
  instance: {
    connection: Connection({
      user: process.env.USER || process.env.USERNAME,
      password: '',
      database: ''
    }, function(success, error) {
      if (!success) {
        logger.print(("ERROR: " + error).red + "\n");
        logger.print("Can not connect to server. Please check if server running.");
        logger.print("\n");
        process.exit(0);
      }
    })
  }
}];

Connection.instances.forEach(function(c) {
  c.logging = false;
});

var connection = Connection.instances[0];
GLOBAL.connection = connection;

App.activeTab = 0;

console.log = function () {
  logger.info.apply(logger, arguments);
}
//console.error = function () {};
App.testing = true;

require('./helpers');

loadBddBase();
loadTestCases("./spec");

global.puts = function (obj, color) {
  if (typeof obj != 'string') {
    obj = node.util.inspect(obj, undefined, 3);
  }
  bdd.reporter.puts(obj + "\n", color);
};

Model.base.makeSync('q');
Model.Procedure.makeSync('findAll', 'createFunction', 'find');
Model.Procedure.prototype.makeSync('drop');

Model.Table.makeSync('publicTables');
Model.Table.makeSyncFn('create', 3 /* error arg posiotion */);
Model.Table.prototype.makeSync('drop', 'addColumnObj', 'insertRow', 'getTotalRows', 'getRows');
Model.Table.prototype.makeSync('isMatView', 'isView', 'getTableType');

SqlImporter.prototype.makeSyncFn('doImport', 3);
SqlExporter.prototype.makeSyncFn('doExport', 3);

// for running test in node.js/io.js
if (!window.localStorage) {
  window.localStorage = require('localStorage');
}

window.localStorage.clear();

DbCleaner(Model.base.connection()).recreateSchema(function () {
  bdd.runAllCases(function(success) {
    if (success) {
      electron.remote.app.quit();
    } else {
      electron.remote.process.exit(1);
    }
  });
});
