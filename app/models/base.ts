//(global as any).Model = {};

class ModelBase {
  
  data: any
  connectionObj: Connection
  static defaultConnection?: Connection
  
  constructor(data  ?: any ) {
    this.data = data;
  }

  q(query : string , ...values : any[] ) {
    var conn = this.connection();
    return conn.q.apply(conn, arguments);
  }

  query(query : string ) {
    return this.q.apply(this, arguments);
  }

  connection(): Connection {
    return this.connectionObj || ModelBase.connection();
  }

  static connection(): Connection {
    if (ModelBase.defaultConnection) {
      return ModelBase.defaultConnection;
    }
    if (typeof App !== 'undefined' && App?.currentTab?.instance?.connection) {
      return App.currentTab.instance.connection;
    }
    throw new Error("No database connection available for Model execution");
  }

  static q(query : string , ...values : any[] ) {
    var connection = this.connection();
    return connection.q.apply(connection, arguments);
  }
}

module.exports = ModelBase;

(global as any).ModelBase = ModelBase;
