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

  it("should support query with % character when no params are provided (PR #151)", async () => {
    var result = await connection.q("SELECT '100% test' AS val");
    assert.equal(result.rows[0].val, '100% test');

    var interpolated = await connection.q("SELECT '%s' AS val", "interpolated 100%");
    assert.equal(interpolated.rows[0].val, 'interpolated 100%');
  });

  it("should cancel query", async () => {
    const promise = connection.query("select pg_sleep(1000)");
    setTimeout(() => connection.stopRunningQuery(), 50);
    try {
      await promise;
      assert.fail("Should have thrown cancellation error");
    } catch (error) {
      assert.equal(error.message, 'canceling statement due to user request');
    }
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
      port: 5432,
      database: 'db',
      ssl: true
    });
  });

  it("should parse azure url with special characters in password (#157)", () => {
    var parsed = Connection.parseConnectionString("postgresql://dbuser:8wAx+xJBp}@recruit-db.azure.com:5432/database");
    assert.equal(parsed.user, "dbuser");
    assert.equal(parsed.password, "8wAx+xJBp}");
    assert.equal(parsed.host, "recruit-db.azure.com");
    assert.equal(parsed.port, 5432);
    assert.equal(parsed.database, "database");
  });

  it("should parse special characters ?, #, @ in password (#113)", () => {
    var parsed = Connection.parseConnectionString("postgresql://dbuser:pass?word#123@host:5432/db");
    assert.equal(parsed.user, "dbuser");
    assert.equal(parsed.password, "pass?word#123");
    assert.equal(parsed.host, "host");
    assert.equal(parsed.port, 5432);
    assert.equal(parsed.database, "db");

    var parsedAt = Connection.parseConnectionString("postgresql://dbuser:p@ssword@host:5432/db");
    assert.equal(parsedAt.user, "dbuser");
    assert.equal(parsedAt.password, "p@ssword");
  });

  it("should configure ssl options for sslmode=require and cloud providers (#150)", () => {
    var parsedRequire = Connection.parseConnectionString("postgresql://user:pass@host:5432/db?sslmode=require");
    assert.equal(parsedRequire.sslmode, "require");
    assert.deepEqual(parsedRequire.ssl, { rejectUnauthorized: false });

    var parsedDisable = Connection.parseConnectionString("postgresql://user:pass@host:5432/db?sslmode=disable");
    assert.equal(parsedDisable.ssl, false);

    var parsedVerifyFull = Connection.parseConnectionString("postgresql://user:pass@host:5432/db?sslmode=verify-full");
    assert.deepEqual(parsedVerifyFull.ssl, { rejectUnauthorized: true });

    var parsedRejectExplicit = Connection.parseConnectionString("postgresql://user:pass@host:5432/db?sslmode=require&rejectUnauthorized=true");
    assert.deepEqual(parsedRejectExplicit.ssl, { rejectUnauthorized: true });
  });

  it("should trim surrounding whitespace from connection url", () => {
    var parsed = Connection.parseConnectionString("  postgresql://user:pass@host:5432/db \n");
    assert.equal(parsed.host, "host");
    assert.equal(parsed.database, "db");
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
      port: 5432,
      database: undefined
    });
  });

  it("should gracefully close all connections with closeAll", async () => {
    const conn1 = new Connection();
    await conn1.connectToServer({
      user: process.env.USER || 'pavel',
      host: 'localhost',
      port: '5432',
      database: 'postbird_test'
    });

    const conn2 = new Connection();
    await conn2.connectToServer({
      user: process.env.USER || 'pavel',
      host: 'localhost',
      port: '5432',
      database: 'postbird_test'
    });

    assert(Connection.instances.includes(conn1), "conn1 should be in instances");
    assert(Connection.instances.includes(conn2), "conn2 should be in instances");

    await Connection.closeAll();

    assert.equal(Connection.instances.length, 0, "All instances should be closed and removed");
  });
});