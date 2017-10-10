require('../app')
require('../lib/jquery.class')
require('../app/connection')
const assert = require('assert');

describe('Connection', () => {
  let connection;

  before(async () => {
    connection = new Connection();
    await connection.connectToServer({
      user: process.env.PG_USER || process.env.USER || process.env.USERNAME,
      password: process.env.PG_PASSWORD || '',
      port: process.env.PG_PORT,
      database: ''
    });

    connection.logging = false;

    try {
      await connection.server.createDatabase('postbird_test');
    } catch (err) {
      if (err.message != 'database "postbird_test" already exists') {
        throw err;
      }
    }

    await connection.switchDb('postbird_test');
    await connection.query("drop schema public cascade; create schema public;");

    App.tabs = [{ instance: { connection: connection} }];
  });

  it("should exec query", async () => {
    var result = await connection.query("select now()");
    assert.equal(result.rows.length, 1);
    assert(result.rows[0].now instanceof Date);
  });

  it("should cancel query", (done) => {
    connection.query("select pg_sleep(1000)", (result, error) => {
      assert.equal(result, undefined);
      assert.equal(error.message, 'canceling statement due to user request');
      done();
    });
    connection.stopRunningQuery();
  });

  it("should get variable", async () => {
    var result = await connection.server.getVariable('unix_socket_permissions');
    assert.equal(result, '0777');
  });
});