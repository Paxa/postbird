global.window = global.window || {};
if (!window.localStorage) {
  window.localStorage = require('localStorage');
}


require('../app');
require('../app/connection');

global.assert = require('./assert_extras');

global.Model = require('../app/models/all');

global.cleanupSchema = async (connection) => {
  if (!connection) {
    connection = Connection.instances[0];
  }
  return connection.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

global.testConnection = async (logging) => {
  var existingConn = getConnection();
  if (existingConn) {
    if (existingConn.hasRunningQuery()) {
      existingConn.stopRunningQuery();
    }
    await cleanupSchema();
    return existingConn;
  }

  var connection = new Connection();
  await connection.connectToServer({
    user: process.env.PG_USER || process.env.USER || process.env.USERNAME,
    password: process.env.PG_PASSWORD || '',
    port: process.env.PG_PORT,
    database: 'postbird_test'
  });

  if (!logging) {
    connection.logging = false;
  }

  /*
  try {
    await connection.server.createDatabase('postbird_test');
  } catch (err) {
    if (err.message != 'database "postbird_test" already exists') {
      throw err;
    }
  }

  await connection.switchDb('postbird_test');
  */
  await cleanupSchema();

  App.tabs = [{ instance: { connection: connection} }];
  App.activeTab = 0;

  return connection;
}

global.TestHelper = {
  publicTables: async () => {
    var result = await Connection.instances[0].query("SELECT * FROM information_schema.tables where table_schema = 'public';");

    return result.rows.map(row => {
      return '' + row.table_name
    });
  }
};

global.getConnection = () => {
  return Connection.instances[0];
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

