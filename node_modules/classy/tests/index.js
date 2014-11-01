#! /usr/bin/env node

global.bdd = require('./bdd');
var assets = require('./bdd_assert');

global.describe = bdd.describe;

global.assert = assets.assert;
global.assert_true = assets.assert_true;
global.assert_match = assets.assert_match;
global.assert_contain = assets.assert_contain;

process.on("uncaughtException", function(err) {
  bdd.onError(err);
});


/// Load testable
global.Classy = require("../classy");
require("../object_ls");

/// Load tests

var glob = require('glob');
var testFiles = glob.sync(__dirname + "/*_test.js");

if (process.argv.length > 2) {
  var pattern = process.argv[2];
  testFiles = testFiles.filter(function(file) {
    return file.indexOf(pattern) != -1;
  });
}

testFiles.forEach(function(fileName) {
  require(fileName);
});

/// Run tests
bdd.runAllCases(function(isSuccess) {
  process.exit(isSuccess ? 0 : 1);
});
