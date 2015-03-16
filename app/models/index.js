var sprintf = require("sprintf-js").sprintf;

global.Model.Index = Model.base.extend({
  init: function (index_name) {
    this.table = index_name;
  }
});
