require('./test_helper');

describe("Model.Server", () => {

  before(async () => {
    await testConnection();
  });

  afterEach(async () => {
    await cleanupSchema();
  });

  it("fetchServerVersion", async () => {
    var conn = getConnection();
    var version = await conn.server.fetchServerVersion();
    assert.contain(version, "PostgreSQL");
  });

  it("listDatabases and templates", async () => {
    var conn = getConnection();
    var dbs = await conn.server.listDatabases();
    assert.ok(Array.isArray(dbs));
    assert.contain(dbs, "postbird_test");

    var templates = await conn.server.databaseTemplatesList();
    assert.ok(Array.isArray(templates));
    assert.contain(templates, "template1");
  });

  it("avaliableEncodings", async () => {
    var conn = getConnection();
    var encodings = await conn.server.avaliableEncodings();
    assert.ok(Array.isArray(encodings));
    assert.contain(encodings, "UTF8");
  });

  it("getVariable", async () => {
    var conn = getConnection();
    var serverVer = await conn.server.getVariable("server_version");
    assert.ok(serverVer);
    assert.match(serverVer, /^\d+/);
  });

  it("listConnections", async () => {
    var conn = getConnection();
    var connections = await conn.server.listConnections();
    assert.ok(Array.isArray(connections));
    assert.ok(connections.length > 0);
    assert.ok(connections[0].datname !== undefined);
  });

  it("create, rename and drop database", async () => {
    var conn = getConnection();
    var dbName1 = "test_postbird_srv_tmp1";
    var dbName2 = "test_postbird_srv_tmp2";

    // Clean up if left from previous failed run
    try { await conn.server.dropDatabase(dbName1); } catch (e) {}
    try { await conn.server.dropDatabase(dbName2); } catch (e) {}

    // Switch back to postbird_test
    await conn.switchDb("postbird_test");

    await conn.server.createDatabase(dbName1);
    var dbsAfterCreate = await conn.server.listDatabases();
    assert.contain(dbsAfterCreate, dbName1);

    await conn.server.renameDatabase(dbName1, dbName2);
    var dbsAfterRename = await conn.server.listDatabases();
    assert.contain(dbsAfterRename, dbName2);
    assert.notContain(dbsAfterRename, dbName1);

    await conn.server.dropDatabase(dbName2);
    await conn.switchDb("postbird_test");
    var dbsAfterDrop = await conn.server.listDatabases();
    assert.notContain(dbsAfterDrop, dbName2);
  });

});
