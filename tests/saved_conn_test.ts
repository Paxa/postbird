require('./test_helper');

describe('SavedConn', () => {

  before(() => {
    window.localStorage.clear();
  });

  it("should create connection", () => {
    var conn = {database: "postbird", username: "bird"};
    Model.SavedConn.saveConnection("test1", conn);

    assert.deepEqual(Model.SavedConn.savedConnection("test1"), conn);
  });

  it("should compare settings", () => {
    var conn = {database: "postbird", username: "bird"};
    Model.SavedConn.saveConnection("test1", conn);

    assert(Model.SavedConn.isEqualWithSaved("test1", conn));
    assert.false(Model.SavedConn.isEqualWithSaved("test1", {database: "postbird", username: "cat"}));
  });

  it("should parse LevelDB buffer encoded in UTF-8", () => {
    const rawData = {
      legacy_prod: { host: "db.production.local", port: 5432, user: "admin" },
      analytics: { host: "analytics.local", port: 5439, user: "readonly" }
    };
    const buf = Buffer.from(`prefix_data_leveldb_header\x00\x01savedConnections\x00${JSON.stringify(rawData)}trailing_leveldb_crc`);
    const parsed = Model.SavedConn.parseConnectionsFromBuffer(buf);

    assert(parsed !== null, "Should extract connections from UTF-8 LevelDB buffer");
    assert.deepEqual(parsed, rawData);
  });

  it("should parse LevelDB buffer encoded in UTF-16LE with odd alignment", () => {
    const rawData = {
      staging_cluster: { host: "staging.aws.internal", port: 5432, user: "developer" }
    };
    const jsonStr = JSON.stringify(rawData);
    const buf = Buffer.concat([
      Buffer.from("prefix_leveldb_\x00\x01", "binary"),
      Buffer.from("savedConnections", "utf16le"),
      Buffer.from("\x01", "binary"), // 1-byte delimiter causing odd alignment
      Buffer.from(jsonStr, "utf16le"),
      Buffer.from("trailing_bytes", "binary"),
    ]);

    const parsed = Model.SavedConn.parseConnectionsFromBuffer(buf);
    assert(parsed !== null, "Should extract connections from UTF-16LE LevelDB buffer");
    assert.deepEqual(parsed, rawData);
  });

  it("should restore and merge connections via loadAndMigrate", async () => {
    window.localStorage.clear();

    const mockConnections = {
      migrated_db: { host: "127.0.0.1", port: 5432, user: "migrated_user" }
    };
    let syncedData = null;

    (window as any).__postbirdRpc = {
      loadSavedConnections: async () => ({ connections: mockConnections, source: "migrated" }),
      saveSavedConnections: async ({ connections }: any) => {
        syncedData = connections;
        return { success: true };
      }
    };

    const updated = await Model.SavedConn.loadAndMigrate();
    assert.equal(updated, true);
    assert.deepEqual(Model.SavedConn.savedConnections(), mockConnections);

    // Now save a new connection and verify dual-persistence to RPC
    Model.SavedConn.saveConnection("new_app_conn", { host: "localhost", port: 5432 });
    assert(syncedData !== null);
    assert.equal(syncedData["new_app_conn"].host, "localhost");
    assert.equal(syncedData["migrated_db"].host, "127.0.0.1");
  });

});
