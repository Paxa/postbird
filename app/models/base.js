global.Model = {};


global.Model.base = jClass.extend({
  className: 'Model.base',

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

  query: function () {
    return this.q.apply(this, arguments);
  },

  connection: function () {
    return Model.base.connection();
  },

  klassExtend: {
    connection: function() {
      if (App.currentTab.instance.connection) {
        return App.currentTab.instance.connection;
      } else {
        throw "Current tab is not connected yet";
      }
    },

    q: function () {
      var connection = Model.base.connection();
      return connection.q.apply(connection, arguments);
    }

  }
});

class ModelBase {
  constructor(data) {
    this.data = data;
  }

  q() {
    if (this.connectionObj) {
      return this.connectionObj.q.apply(this.connectionObj, arguments);
    } else if (App.currentTab.instance.connection) {
      return Connection.prototype.q.apply(App.currentTab.instance.connection, arguments);
    } else {
      throw "Current tab is not connected yet";
    }
  }

  query() {
    return this.q.apply(this, arguments);
  }

  connection() {
    return this.connectionObj || ModelBase.connection();
  }

  static connection() {
    if (App.currentTab.instance.connection) {
      return App.currentTab.instance.connection;
    } else {
      throw "Current tab is not connected yet";
    }
  }

  static q() {
    var connection = this.connection();
    return connection.q.apply(connection, arguments);
  }
}

//ModelBase.extend = jClass.extend;

module.exports = ModelBase;

global.ModelBase = ModelBase;
