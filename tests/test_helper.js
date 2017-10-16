global.window = global.window || {};
if (!window.localStorage) {
  window.localStorage = require('localStorage');
}


require('../app');
require('../lib/jquery.class');
require('../app/connection');

global.assert = require('./assert_extras');

global.Model = require('../app/models/all');

global.cleanupSchema = async (connection) => {
  if (!connection) {
    connection = Connection.instances[0];
  }
  return connection.query("drop schema public cascade; create schema public;");
}

global.testConnection = async () => {
  if (getConnection()) {
    await cleanupSchema();
    return getConnection();
  }

  var connection = new Connection();
  await connection.connectToServer({
    user: process.env.PG_USER || process.env.USER || process.env.USERNAME,
    password: process.env.PG_PASSWORD || '',
    port: process.env.PG_PORT,
    database: 'postbird_test'
  });

  connection.logging = false;

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

global.getConnection = () => {
  return Connection.instances[0];
}
