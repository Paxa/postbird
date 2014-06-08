var sprintf = require("sprintf-js").sprintf;

global.Model.Table = Model.base.extend({
  init: function (index_name) {
    this.table = index_name;
  }
});
