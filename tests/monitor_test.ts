require('./test_helper');
require('../lib/widgets/sparkline');

describe("Model.Monitor", () => {
  before(async () => {
    await testConnection();
  });

  afterEach(async () => {
    await cleanupSchema();
  });

  it("fetchRealtimeStats returns connection, db stats, and active queries", async () => {
    const conn = getConnection();
    const monitor = new Model.Monitor(conn);
    const stats = await monitor.fetchRealtimeStats();

    assert.ok(stats);
    assert.ok(stats.connections);
    assert.equal(typeof stats.connections.total, "number");
    assert.equal(typeof stats.connections.max, "number");
    assert.ok(stats.connections.max > 0);

    assert.ok(stats.database);
    assert.equal(typeof stats.database.cacheHitRatio, "number");
    assert.ok(stats.database.cacheHitRatio >= 0 && stats.database.cacheHitRatio <= 100);
    assert.ok(Array.isArray(stats.activeQueries));
    assert.equal(typeof stats.summedQueryTimeMs, "number");
  });

  it("fetchStorageStats returns db size, buffers config, and index summary", async () => {
    const conn = getConnection();
    const monitor = new Model.Monitor(conn);
    const stats = await monitor.fetchStorageStats();

    assert.ok(stats);
    assert.ok(stats.dbSizeBytes > 0);
    assert.equal(typeof stats.dbSizePretty, "string");
    assert.equal(typeof stats.totalIndexesBytes, "number");
    assert.equal(typeof stats.sharedBuffersBytes, "number");
    assert.ok(typeof stats.bufferFitPercent, "number");
    assert.ok(Array.isArray(stats.topTables));
  });

  it("fetchVacuumStats returns table bloat statistics and active vacuum array", async () => {
    const conn = getConnection();
    const monitor = new Model.Monitor(conn);

    // Create a temporary table and generate dead tuples
    await conn.query("CREATE TABLE bloat_sample_test (id serial, payload text);");
    await conn.query("INSERT INTO bloat_sample_test (payload) SELECT 'sample_' || generate_series(1, 100);");
    await conn.query("DELETE FROM bloat_sample_test WHERE id > 20;");

    const stats = await monitor.fetchVacuumStats();

    assert.ok(stats);
    assert.ok(Array.isArray(stats.inProgress));
    assert.ok(Array.isArray(stats.tables));
    assert.equal(typeof stats.highBloatCount, "number");

    await conn.query("DROP TABLE IF EXISTS bloat_sample_test;");
  });

  it("fetchReplicationStats returns role, slots, and replication array", async () => {
    const conn = getConnection();
    const monitor = new Model.Monitor(conn);
    const stats = await monitor.fetchReplicationStats();

    assert.ok(stats);
    assert.equal(typeof stats.isReplica, "boolean");
    assert.ok(Array.isArray(stats.standbys));
    assert.ok(Array.isArray(stats.replicationSlots));
    assert.equal(typeof stats.inactiveSlotsCount, "number");
  });

  it("fetchSlowQueries detects pg_stat_statements extension gracefully", async () => {
    const conn = getConnection();
    const monitor = new Model.Monitor(conn);
    const stats = await monitor.fetchSlowQueries();

    assert.ok(stats);
    assert.equal(typeof stats.hasExtension, "boolean");
    assert.ok(Array.isArray(stats.queries));
  });

  it("cancelQuery cancels a running backend query by PID", async () => {
    const conn = getConnection();
    const monitor = new Model.Monitor(conn);

    const conn2 = new Connection();
    await conn2.connectToServer({
      user: process.env.PG_USER || process.env.USER || process.env.USERNAME,
      password: process.env.PG_PASSWORD || '',
      port: process.env.PG_PORT,
      database: 'postbird_test'
    });

    const client = (conn2.connection as any)._clients[0];
    const pid = client ? client.processID : null;
    assert.ok(pid, "Should obtain backend processID");

    const sleepPromise = conn2.query("SELECT pg_sleep(10);").catch((err) => {
      return "canceled";
    });

    await new Promise((r) => setTimeout(r, 60));

    const cancelRes = await monitor.cancelQuery(pid);
    assert.equal(cancelRes, true, "cancelQuery should return true for active sleeping backend");

    await sleepPromise;
    await conn2.close();
  });

  it("cancelQuery and terminateQuery return false for non-existent PIDs", async () => {
    const conn = getConnection();
    const monitor = new Model.Monitor(conn);

    const cancelRes = await monitor.cancelQuery(999999);
    assert.equal(cancelRes, false, "cancelQuery on invalid PID should return false");

    const termRes = await monitor.terminateQuery(999999);
    assert.equal(termRes, false, "terminateQuery on invalid PID should return false");
  });

  it("Sparkline renders valid SVG markup with smooth paths and markers", () => {
    const svg = (global as any).Sparkline.renderSvg([10, 20, 15, 40, 25, 30], {
      width: 400,
      height: 60,
      strokeColor: '#007aff',
      unit: ' qps'
    });

    assert.contain(svg, "<svg");
    assert.contain(svg, "</svg>");
    assert.contain(svg, 'class="macos-sparkline-svg"');
    assert.contain(svg, 'linearGradient');
    assert.contain(svg, 'Peak: 40 qps');
  });

  it("Sparkline gracefully handles empty data arrays", () => {
    const svg = (global as any).Sparkline.renderSvg([], {
      strokeColor: '#ff9500'
    });

    assert.contain(svg, "<svg");
    assert.contain(svg, "</svg>");
    assert.contain(svg, 'Peak: 1');
  });

  it("ViewHelpers.escapeHTML properly escapes HTML characters and handles falsy values", () => {
    const ViewHelpers = (global as any).ViewHelpers;
    assert(ViewHelpers && typeof ViewHelpers.escapeHTML === "function", "ViewHelpers.escapeHTML must exist");
    assert.equal(ViewHelpers.escapeHTML("<script>alert('xss')</script>"), "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    assert.equal(ViewHelpers.escapeHTML("SELECT * FROM foo WHERE a = '1' AND b = \"2\" & c < 5;"), "SELECT * FROM foo WHERE a = &#039;1&#039; AND b = &quot;2&quot; &amp; c &lt; 5;");
    assert.equal(ViewHelpers.escapeHTML(null), "");
    assert.equal(ViewHelpers.escapeHTML(undefined), "");
  });
});
