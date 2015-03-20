if (!global.window) global.window = {};

global.TESTING = true;

var async = require('async');

require('../sugar/redscript-loader');

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

App.tabs = [{
  instance: {
    connection: Connection({
      user: 'pavel',
      password: '',
      database: 'postbird_testing'
    }, function(success, error) {
      if (!success) {
        process.stdout.write(("ERROR: " + error).red + "\n");
        process.stdout.write("Can not connect to server. Please check if server running.");
        process.stdout.write("\n");
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

console.error = function () {};
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
Model.Table.prototype.makeSync('drop', 'addColumnObj', 'insertRow', 'getTotalRows');

SqlImporter.prototype.makeSyncFn('doImport', 3);
SqlExporter.prototype.makeSyncFn('doExport', 3);

// for running test in node.js/io.js
if (!window.localStorage) {
  window.localStorage = require('localStorage');
}

window.localStorage.clear();

var queue = async.queue(function (fn, callback) {
  fn(callback);
}, 1);

queue.push(function (callback) {
  DbCleaner(Model.base.connection()).recreateSchema(callback);
});

queue.push(function(callback) {
  bdd.runAllCases(function() {
    callback();
    process.exit(0);
  });
});
