var sprintf = require("sprintf-js").sprintf;

var base = require('./base');

global.Model.Index = Model.base.extend({
  init: function (index_name) {
    this.table = index_name;
  }
});

var Server = require('./server');
var User = require('./user');
var Table = require('./table');
var Column = require('./column');
var Trigger = require('./trigger');
var Procedure = require('./procedure');
var Schema = require('./schema');

module.exports = {
  Server: Server,
  User: User,
  Table: Table,
  Column: Column,
  Trigger: Trigger,
  Procedure: Procedure,
  Index: global.Model.Index,
  Schema: Schema
};
