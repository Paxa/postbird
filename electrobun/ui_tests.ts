// @ts-nocheck

export async function runUITests() {
  console.log("\n=======================================================");
  console.log("       STARTING ELECTROBUN UI INTEGRATION TESTS        ");
  console.log("=======================================================\n");

  const results = [];

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  async function waitFor(fn, timeout = 5000, interval = 50) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const res = fn();
        if (res) return res;
      } catch (e) {}
      await new Promise(r => setTimeout(r, interval));
    }
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
  }

  async function test(name, fn) {
    try {
      console.log(`[UI Test] Running: ${name}...`);
      await fn();
      console.log(`✓ [UI Test PASS]: ${name}`);
      results.push({ name, passed: true });
    } catch (err) {
      console.error(`✗ [UI Test FAIL]: ${name}:`, err.message || err);
      results.push({ name, passed: false, error: err.message || String(err) });
    }
  }

  // 1. Initial window and login screen
  await test("shows initial window and connection screen", async () => {
    assert(window.App, "App should be defined");
    assert(window.App.tabs.length >= 1, "Should have at least 1 tab");
    assert(window.App.loginScreen, "Login screen should exist");
  });

  // 2. Connect to database
  let dbScreen = null;
  await test("connects to postbird_test database", async () => {
    await new Promise((resolve, reject) => {
      const conn = new window.Connection();
      conn.connectToServer({
        user: window.process.env.USER || "pavel",
        host: "localhost",
        port: 5432,
        database: "postbird_test",
      }, (success, err) => {
        if (!success) return reject(err || new Error("Connection failed"));
        const tab = window.App.addDbScreen(conn, "postbird_test", {});
        tab.activate();
        dbScreen = tab.instance;
        resolve();
      });
    });
    assert(dbScreen, "DbScreen instance should be created");
  });

  // 3. Database select dropdown populated
  await test("loads databases into select dropdown", async () => {
    await new Promise((resolve) => {
      dbScreen.fetchDbList(() => resolve());
    });
    const options = dbScreen.view.databaseSelect.find("option");
    assert(options.length > 0, "Database select should have options");
  });

  // 4. Create a test table
  await test("creates test table with various data types", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_ui_table CASCADE;");
    await dbScreen.connection.query(`
      CREATE TABLE test_ui_table (
        id serial primary key,
        name varchar(100) not null,
        num integer default 42,
        is_active boolean default true,
        created_at timestamptz default now()
      );
    `);
    await dbScreen.connection.query(`
      INSERT INTO test_ui_table (name, num) VALUES ('Electrobun Test', 123);
    `);
    await new Promise((resolve) => {
      dbScreen.fetchTablesAndSchemas(() => resolve());
    });
    const tableNodes = dbScreen.view.tablesList.find('li[table-name="test_ui_table"]');
    assert(tableNodes.length > 0, "test_ui_table should appear in sidebar table list");
  });

  // 5. Structure tab renders without errors
  await test("renders table structure tab correctly", async () => {
    dbScreen.currentSchema = null;
    dbScreen.currentTable = null;
    await dbScreen.tableSelected("public", "test_ui_table", "structure");
    const content = dbScreen.view.tabContent("structure");
    await waitFor(() => content.find(".columns-list-table tbody tr").length >= 5);
    assert(content.find(".error").length === 0, "Structure tab should have no errors");
  });

  // 6. Content tab renders table rows and formatted dates
  await test("renders table content tab and formats cells", async () => {
    await dbScreen.view.showTab("content");
    const content = dbScreen.view.tabContent("content");
    await waitFor(() => content.find(".rescol-content-wrapper table tbody tr").length >= 1);
    assert(content.find(".error").length === 0, "Content tab should have no errors");
    const rows = content.find(".rescol-content-wrapper table tbody tr");
    const cellText = rows.text();
    assert(cellText.includes("Electrobun Test"), "Cell should contain 'Electrobun Test'");
  });

  // 7. Table SQL definition (pg_dump via child_process RPC)
  await test("generates table source SQL via pg_dump", async () => {
    const table = new window.Model.Table("public", "test_ui_table");
    const sql = await table.getSourceSql();
    assert(sql && typeof sql === "string", "Source SQL should be a non-empty string");
    assert(sql.includes("CREATE TABLE") || sql.includes("test_ui_table"), "Source SQL should contain CREATE TABLE");
  });

  // 8. Context menu opens and renders items without throwing
  await test("context menu popup renders correctly", async () => {
    const content = dbScreen.view.tabContent("content");
    const firstRow = content.find(".rescol-content-wrapper table tbody tr").first();
    assert(firstRow.length > 0, "Should have a row for context menu");
    const target = firstRow.find("td").first()[0] || firstRow[0];
    target.dispatchEvent(new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 200,
      clientY: 200,
    }));
    await waitFor(() => document.getElementById("postbird-context-menu-popup") !== null);
    const popup = document.getElementById("postbird-context-menu-popup");
    assert(popup, "Context menu popup should be rendered in DOM");
    popup.remove();
  });

  // 9. Clean up
  await test("cleans up test table", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_ui_table CASCADE;");
  });

  // Summary
  const failed = results.filter(r => !r.passed).length;
  console.log("\n=======================================================");
  console.log(`UI TESTS SUMMARY: ${results.length - failed}/${results.length} PASSED`);
  if (failed > 0) {
    console.error(`FAILED: ${failed} test(s) failed!`);
  }
  console.log("=======================================================\n");

  if (window.__postbirdRpc && window.__postbirdRpc.finishTests) {
    await window.__postbirdRpc.finishTests({ total: results.length, failed });
  }
}
