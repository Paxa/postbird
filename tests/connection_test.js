require('./test_helper')
var moment = require('moment');

describe('Connection', () => {
  let connection;

  before(async () => {
    connection = await testConnection();
  });

  it("should exec query", async () => {
    var result = await connection.query("select now()");
    assert.equal(result.rows.length, 1);
    assert(result.rows[0].now instanceof moment);
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

  it("should parse connection string", () => {
    var parsed = Connection.parseConnectionString("postgres://user:pass@host/db?ssl=true");

    assert.deepEqual(parsed, {
      user: 'user',
      password: 'pass',
      host: 'host',
      port: '5432',
      database: 'db',
      query: 'ssl=true'
    });
  });
});