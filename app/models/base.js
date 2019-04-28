//global.Model = {};

class ModelBase {
  /*::
  data: any
  connectionObj: Connection
  */
  constructor(data /*:: ?: any */) {
    this.data = data;
  }

  q(query /*: string */, ...values /*: any[] */) {
    if (this.connectionObj) {
      return this.connectionObj.q.apply(this.connectionObj, arguments);
    } else if (App.currentTab.instance.connection) {
      return Connection.prototype.q.apply(App.currentTab.instance.connection, arguments);
    } else {
      throw new Error("Current tab is not connected yet");
    }
  }

  query(query /*: string */) {
    return this.q.apply(this, arguments);
  }

  connection() {
    return this.connectionObj || ModelBase.connection();
  }

  static connection() {
    if (App.currentTab.instance.connection) {
      return App.currentTab.instance.connection;
    } else {
      throw new Error("Current tab is not connected yet");
    }
  }

  static q(query /*: string */, ...values /*: any[] */) {
    var connection = this.connection();
    return connection.q.apply(connection, arguments);
  }
}

module.exports = ModelBase;

global.ModelBase = ModelBase;
