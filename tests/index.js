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

App.activeTab = 0;

console.error = function () {};
App.testing = true;


var should = require('should');
var bdd = require('../lib/bdd');

global.should = should;
global.describe = bdd.describe;
global.assert = function assert (var1, var2) {
  if (var1 !== var2) {
    throw "'asset' failed: " + String(var1) + " is not " + String(var2);
  }
};

global.assert_true = function assert_true (value) {
  if (!value) {
    throw "'assert_true' failed: expected true, got " + String(value);
  }
}

require('./spec/table_spec');

bdd.runAllCases(function() {
 global.GUI && GUI.App.quit();
 process.exit(0);
});