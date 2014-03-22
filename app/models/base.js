global.Model = {};

global.Model.base = jClass.extend({
  init: function(data) {
    this.data = data;
  },

  q: function () {
    if (App.currentTab.instance.connection) {
      return Connection.prototype.q.apply(App.currentTab.instance.connection, arguments);
    } else {
      throw "Current tab is not connected yet";
    }
  },

  connection: function () {
    return Model.base.connection();
  }
});

Model.base.connection = function() {
  if (App.currentTab.instance.connection) {
    return App.currentTab.instance.connection;
  } else {
    throw "Current tab is not connected yet";
  }
};