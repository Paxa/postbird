if (!global.window) global.window = {};

var async = require('async');

require('../sugar/redscript-loader');

require('../lib/jquery.class');
require('../lib/node_lib');
require('../lib/arg');
require('../lib/sql_splitter');

require('../app/connection');
require("../app/models/base");
require("../app/models/table");
require('../app');

require('../sugar/redscript-loader');

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

App.activeTab = 0;

console.error = function () {};
App.testing = true;

require('./helpers');

loadBddBase();
loadTestCases("./spec");

/*
require('./spec/table_spec');
require('./spec/column_spec');
require('./spec/connection_spec');
require('./spec/sql_splitter_spec');
*/

connection.publicTables(function(data) {
  var queue = async.queue(function (fn, callback) {
    fn(callback);
  }, 1);

  data.forEach(function(table) {
    if (table.table_schema != 'pg_catalog' && table.table_schema != 'information_schema') {
      queue.push(function(callback) {
        console.log('Deleting ' + table.table_type + ' ' + table.table_name);
        Model.Table(table.table_schema, table.table_name).drop(callback);
      });
    }
  });

  queue.push(function(callback) {
    bdd.runAllCases(function() {
     global.GUI && GUI.App.quit();
     callback();
     process.exit(0);
    });
  });
});

