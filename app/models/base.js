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
    },

    qSync: function () {
      if (!App.currentTab.instance.connection) {
        throw "Current tab is not connected yet";
      }

      if (!global.Fiber || !global.Fiber.current) {
        throw "Fiber is not running";
      }

      var params = Array.prototype.slice.call(arguments);
      var newValue;
      var fiber = Fiber.current;

      params.push(function (result, error) {
        if (error) {
          throw error;
        }
        newValue = result;
        fiber.run();
      });

      Connection.prototype.q.apply(App.currentTab.instance.connection, params);

      Fiber.yield();
      return newValue;
    }
  }
});
