var async = require('async');

require('../sugar/redscript-loader');
require('../lib/jquery.class');
require('../lib/arg');

require('../app/connection');
require('../app');

App.tabs = [{
  instance: {
    connection: Connection({
      user: 'pavel',
      password: '',
      database: 'postbird_testing'
    }, function() {})
  }
}];

Connection.instances.forEach(function(c) {
  c.logging = false;
});

var connection = Connection.instances[0];

App.activeTab = 0;

console.error = function () {};
App.testing = true;

var should = require('should');
var bdd = require('../lib/bdd');

global.should = should;
global.describe = bdd.describe;
global.assert = function assert (var1, var2) {
  if (typeof var1 == 'object') var1 = JSON.stringify(var1);
  if (typeof var2 == 'object') var2 = JSON.stringify(var2);

  if (var1 !== var2) {
    bdd.onError(new Error("'asset' failed: " + String(var1) + " is not " + String(var2)));
    //throw "'asset' failed: " + String(var1) + " is not " + String(var2);
  }
};

global.assert_true = function assert_true (value) {
  if (!value) {
    //var stack = new Error().stack;
    //console.log(stack.join("\n"));
    bdd.onError(new Error("'assert_true' failed: expected true, got " + String(value)));
    //throw "'assert_true' failed: expected true, got " + String(value);
  }
}

process.on("uncaughtException", function(err) {
  bdd.onError(err);
});

require('./helpers');

require('./spec/table_spec');
require('./spec/column_spec');

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

