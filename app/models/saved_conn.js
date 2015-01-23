global.Model.SavedConn = jClass.extend({
  klassExtend: {
    savedConnections: function () {
      if (window.localStorage.savedConnections) {
        return JSON.parse(window.localStorage.savedConnections);
      } else {
        return {};
      }
    },

    saveConnection: function (name, options) {
      var newData = this.savedConnections();
      newData[name] = options;
      window.localStorage.savedConnections = JSON.stringify(newData);
    },

    renameConnection: function (oldName, newName) {
      var data = this.savedConnections();
      data[newName] = data[oldName];
      delete data[oldName];
      window.localStorage.savedConnections = JSON.stringify(data);
      return true;
    },

    removeConnection: function (name) {
      var data = this.savedConnections();
      delete data[name];
      window.localStorage.savedConnections = JSON.stringify(data);
      return true;
    },

    savedConnection: function (name) {
      return this.savedConnections()[name];
    },

    isEqualWithSaved: function(name, options) {
      return JSON.stringify(this.savedConnection(name)) == JSON.stringify(options);
      //return Object.is(this.savedConnection(name), options);
    },
  }

});

