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
      application_name: 'Postbird.app',
      user: 'user',
      password: 'pass',
      host: 'host',
      port: '5432',
      database: 'db',
      ssl: true
    });
  });

  it("should generate connection string", async () => {
    var connStr = "postgres://user:pass@host/db";
    var parsed = Connection.parseConnectionString(connStr);
    var generated = Connection.generateConnectionString(parsed);
    assert.deepEqual(generated, "postgres://user:pass@host:5432/db")
  });

  it("should generate connection string for unix socket", async () => {
    var generated = Connection.generateConnectionString({
      host: "/tmp",
      port: "5435"
    });
    assert.deepEqual(generated, "postgres://%2Ftmp/template1?socketPort=5435");

    var parsed = Connection.parseConnectionString(generated);

    assert.deepEqual(parsed, {
      application_name: 'Postbird.app',
      user: undefined,
      password: undefined,
      host: '/tmp',
      port: '5435',
      database: 'template1'
    });
  });

  it("should set deefault params", async () => {
    var parsed = Connection.parseConnectionString("postgres://");
    assert.deepEqual(parsed, {
      application_name: 'Postbird.app',
      user: undefined,
      password: undefined,
      host: undefined,
      port: '5432',
      database: undefined
    });
  })
});