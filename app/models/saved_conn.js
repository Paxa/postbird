class SavedConn {

  static savedConnections () {
    if (window.localStorage.savedConnections) {
      return JSON.parse(window.localStorage.savedConnections);
    } else {
      return {};
    }
  }

  static saveConnection (name, options) {
    var newData = this.savedConnections();
    newData[name] = options;
    window.localStorage.savedConnections = JSON.stringify(newData);
  }

  static hasConnection(name) {
    return !!this.savedConnections()[name];
  }

  static renameConnection (oldName, newName) {
    var data = this.savedConnections();
    data[newName] = data[oldName];
    delete data[oldName];
    window.localStorage.savedConnections = JSON.stringify(data);
    return true;
  }

  static removeConnection (name) {
    var data = this.savedConnections();
    delete data[name];
    window.localStorage.savedConnections = JSON.stringify(data);
    return true;
  }

  static savedConnection (name) {
    return this.savedConnections()[name];
  }

  static isEqualWithSaved(name, options) {
    // add default field type=standard
    options = Object.assign({type: 'standard'}, options);
    var savedVal = Object.assign({type: 'standard'}, this.savedConnection(name));
    return JSON.stringify(savedVal) == JSON.stringify(options);
    //return Object.is(this.savedConnection(name), options);
  }
}

/*::
declare var SavedConn__: typeof SavedConn
*/

module.exports = SavedConn;
