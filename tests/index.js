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
GLOBAL.connection = connection;

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
        bdd.reporter.puts('Deleting ' + table.table_type + ' ' + table.table_name + "\n", "yellow");

        Model.Table(table.table_schema, table.table_name).safeDrop(function (result, error) {
          if (error) {
            var msg = "Drop table error: " + error + "\n";
            bdd.reporter.puts(msg, "red");
            if (error.detail) bdd.reporter.puts(error.detail + "\n");
            if (error.hint) bdd.reporter.puts("HINST: " + error.hint + "\n");
            process.exit(1);
          }
          callback();
        });
      });
    }
  });

  queue.push(function (callback) {
    connection.dropUserFunctions(function(result, error) {
      if (error) {
        //console.log(error);
        var msg = "Drop procedure error: " + error + "\n";
        bdd.reporter.puts(msg, "red");
        bdd.reporter.puts(error.query + "\n");
        if (error.detail) bdd.reporter.puts(error.detail + "\n");
        if (error.hint) bdd.reporter.puts("HINST: " + error.hint + "\n");
        process.exit(1);
      }
      callback();
    });
  });

  queue.push(function(callback) {
    bdd.runAllCases(function() {
     global.GUI && GUI.App.quit();
     callback();
     process.exit(0);
    });
  });
});

