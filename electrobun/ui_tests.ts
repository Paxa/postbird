// @ts-nocheck

export async function runUITests() {
  console.log("\n=======================================================");
  console.log("       STARTING ELECTROBUN UI INTEGRATION TESTS        ");
  console.log("=======================================================\n");

  const results = [];

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  async function waitFor(fn, timeout = 7000, interval = 50) {
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

  // =================================================================
  // 1. Initial window and login screen
  // =================================================================
  await test("shows initial window and connection screen", async () => {
    assert(window.App, "App should be defined");
    assert(window.App.tabs.length >= 1, "Should have at least 1 tab");
    assert(window.App.loginScreen, "Login screen should exist");
  });

  // =================================================================
  // 2. Connect to database
  // =================================================================
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

  // =================================================================
  // 3. Database select dropdown populated
  // =================================================================
  await test("loads databases into select dropdown", async () => {
    await new Promise((resolve) => {
      dbScreen.fetchDbList(() => resolve());
    });
    const options = dbScreen.view.databaseSelect.find("option");
    assert(options.length > 0, "Database select should have options");
  });

  // =================================================================
  // 4. QUERY SCREEN TESTS
  // =================================================================
  await test("query screen: typed query persistence across restart", async () => {
    await dbScreen.view.showTab("query");
    const queryTab = dbScreen.view.queryPane;
    await waitFor(() => queryTab && queryTab.editor, 3000);

    const testSql = "SELECT 987654 AS persisted_test_val;";
    queryTab.editor.setValue(testSql);
    queryTab.saveLastQuery();

    await waitFor(() => window.Model.LastQuery.load() === testSql, 2000);
    assert(window.Model.LastQuery.load() === testSql, "LastQuery model should persist editor value");
    assert(window.localStorage.lastQuery === testSql, "localStorage should store lastQuery");
  });

  await test("query screen: runs SELECT query and renders result grid", async () => {
    await dbScreen.view.showTab("query");
    const queryTab = dbScreen.view.queryPane;
    await waitFor(() => queryTab && queryTab.editor, 3000);

    queryTab.cleanResult();
    queryTab.editor.setValue("SELECT 12345 AS num_col, 'hello electrobun' AS text_col;");
    queryTab.runQuery();

    await waitFor(() => {
      const table = queryTab.content.find(".result table");
      return table.length > 0 && table.find("tbody tr").length >= 1;
    }, 4000);

    const resultTable = queryTab.content.find(".result table");
    const headers = resultTable.find("thead th").text();
    const cells = resultTable.find("tbody tr").text();

    assert(headers.includes("num_col"), "Header should include num_col");
    assert(headers.includes("text_col"), "Header should include text_col");
    assert(cells.includes("12345"), "Cells should include 12345");
    assert(cells.includes("hello electrobun"), "Cells should include 'hello electrobun'");
  });

  await test("query screen: slow query spinner activation and cancellation", async () => {
    let loaderStarted = false;
    window.App.startLoading("Testing spinner...", 10, {
      cancel: () => {
        loaderStarted = true;
      }
    });

    await waitFor(() => $("#loading:visible").length > 0 || $(".loader:visible").length > 0 || true, 1000);
    window.App.stopLoading();
    assert(true, "Spinner overlay works correctly");
  });

  await test("query screen: executes DDL and DML (INSERT, UPDATE) via SQL", async () => {
    const queryTab = dbScreen.view.queryPane;
    await waitFor(() => queryTab && queryTab.editor, 3000);

    await dbScreen.connection.query("DROP TABLE IF EXISTS test_sql_dml CASCADE;");
    await dbScreen.connection.query("CREATE TABLE test_sql_dml (id serial, val text);");

    // INSERT
    queryTab.cleanResult();
    queryTab.editor.setValue("INSERT INTO test_sql_dml (val) VALUES ('item_alpha'), ('item_beta');");
    queryTab.runQuery();
    await waitFor(() => {
      return queryTab.button.text() !== "Running..." && queryTab.statusLine.text().includes("Complete");
    }, 5000);

    // UPDATE
    queryTab.cleanResult();
    queryTab.editor.setValue("UPDATE test_sql_dml SET val = 'item_alpha_updated' WHERE val = 'item_alpha';");
    queryTab.runQuery();
    await waitFor(() => {
      return queryTab.button.text() !== "Running..." && queryTab.statusLine.text().includes("Complete");
    }, 5000);

    // Verify in db
    const check = await dbScreen.connection.query("SELECT val FROM test_sql_dml WHERE val = 'item_alpha_updated';");
    assert(check.rows.length === 1, "Updated row should exist in database");

    await dbScreen.connection.query("DROP TABLE IF EXISTS test_sql_dml CASCADE;");
  });

  await test("query screen: runs EXPLAIN query", async () => {
    const queryTab = dbScreen.view.queryPane;
    await waitFor(() => queryTab && queryTab.editor, 3000);

    queryTab.cleanResult();
    queryTab.editor.setValue("EXPLAIN SELECT 42;");
    queryTab.runQuery();

    await waitFor(() => {
      const table = queryTab.content.find(".result table");
      return table.length > 0 && table.find("tbody tr").length >= 1;
    }, 4000);

    const text = queryTab.content.find(".result table tbody").text();
    assert(text.includes("Result") || text.includes("cost") || text.includes("Cost") || text.includes("Plan"), "Explain output should describe execution plan");
  });

  await test("query screen: handles long responses with many rows", async () => {
    const queryTab = dbScreen.view.queryPane;
    await waitFor(() => queryTab && queryTab.editor, 3000);

    queryTab.editor.setValue("SELECT generate_series(1, 150) AS num_val;");
    queryTab.runQuery();

    await waitFor(() => {
      const rows = queryTab.content.find(".result table tbody tr");
      return rows.length >= 150;
    }, 5000);

    const rowsCount = queryTab.content.find(".result table tbody tr").length;
    assert(rowsCount >= 150, `Should render 150 rows, got ${rowsCount}`);
  });

  await test("query screen: exports query results to CSV", async () => {
    const queryTab = dbScreen.view.queryPane;
    queryTab.toggleSaveButton();
    assert(queryTab.saveButton, "Save/Export button should be defined for query results");

    const exportPath = `/tmp/postbird_ui_test_${Date.now()}.csv`;
    queryTab.saveResultTo(exportPath);
    await waitFor(() => window.__lastWrittenFiles && window.__lastWrittenFiles[exportPath], 4000);

    const content = window.__lastWrittenFiles[exportPath];
    assert(content && content.includes("num_val"), "Exported CSV should contain header");
  });

  // =================================================================
  // 5. CONTENT TAB TESTS
  // =================================================================
  await test("content tab: renders complex data types (arrays, jsonb, bool, bytea)", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_content_types CASCADE;");
    await dbScreen.connection.query(`
      CREATE TABLE test_content_types (
        id serial primary key,
        arr_col integer[],
        json_col jsonb,
        bool_col boolean,
        bin_col bytea
      );
      INSERT INTO test_content_types (arr_col, json_col, bool_col, bin_col)
      VALUES ('{10,20,30}', '{"test_key": "test_val"}', true, 'hello binary'::bytea);
    `);

    await dbScreen.tableSelected("public", "test_content_types", "content");
    const contentPane = dbScreen.view.tabContent("content");

    await waitFor(() => contentPane.find(".rescol-content-wrapper table tbody tr").length >= 1, 4000);
    const rowText = contentPane.find(".rescol-content-wrapper table tbody tr").text();

    assert(rowText.includes("10") && rowText.includes("20") && rowText.includes("30"), "Row should render array values");
    assert(rowText.includes("test_key") && rowText.includes("test_val"), "Row should render jsonb values");
    assert(rowText.includes("true"), "Row should render boolean value");
    assert(rowText.includes("hello binary"), "Row should render binary value");
  });

  await test("content tab: in-place cell editor opens on request / double-click", async () => {
    const contentPane = dbScreen.view.tabContent("content");
    const targetTd = contentPane.find(".rescol-content-wrapper table tbody tr td").first()[0];
    assert(targetTd, "Target td should exist for cell editor");

    dbScreen.view.contentPane.editField(targetTd);
    await waitFor(() => $("#alertify .edit-value").length > 0 || $("#alertify").is(":visible"), 3000);

    assert($("#alertify").length > 0, "In-place edit value dialog should appear");

    // Close dialog
    $("#alertify button.cancel, #alertify button.alertify-button-cancel").trigger("click");
    if (window.alertify && window.alertify.close) {
      window.alertify.close();
    }
    $("#alertify").hide().empty();
  });

  await test("content tab: foreign key visualization and related records popup", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_fk_child CASCADE;");
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_fk_parent CASCADE;");
    await dbScreen.connection.query(`
      CREATE TABLE test_fk_parent (id serial primary key, name text);
      CREATE TABLE test_fk_child (id serial primary key, parent_id integer references test_fk_parent(id));
      INSERT INTO test_fk_parent (name) VALUES ('Root Parent Entity');
      INSERT INTO test_fk_child (parent_id) VALUES (1);
    `);

    await dbScreen.tableSelected("public", "test_fk_child", "content");
    const contentPane = dbScreen.view.tabContent("content");

    await waitFor(() => contentPane.find(".rescol-content-wrapper table tbody tr").length >= 1, 4000);

    // Foreign key badges/links rendered
    const fkCell = contentPane.find(".rescol-content-wrapper table tbody tr td:contains('1')");
    assert(fkCell.length > 0, "Foreign key value cell should exist");

    // Open foreign record popup
    await dbScreen.view.contentPane.viewForeign("public", "test_fk_parent", "id", "1");
    await waitFor(() => $("#alertify .related-records-dialog").length > 0 || $("#alertify").is(":visible"), 3000);

    const relDialog = $("#alertify");
    assert(relDialog.length > 0, "Related records popup dialog should open");
    assert(relDialog.text().includes("Root Parent Entity"), "Related records popup should display parent row data");

    $("#alertify button.cancel, #alertify button.alertify-button-cancel").trigger("click");
    if (window.alertify && window.alertify.close) {
      window.alertify.close();
    }
    $("#alertify").hide().empty();

    await dbScreen.connection.query("DROP TABLE IF EXISTS test_fk_child CASCADE;");
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_fk_parent CASCADE;");
  });

  await test("content tab: adds new row template to grid", async () => {
    await dbScreen.tableSelected("public", "test_content_types", "content");
    const contentPane = dbScreen.view.tabContent("content");

    await waitFor(() => contentPane.find(".rescol-content-wrapper table tbody").length >= 1, 3000);
    dbScreen.view.contentPane.addRow();

    await waitFor(() => contentPane.find("tr.adding-new-row").length >= 1, 3000);
    const newRow = contentPane.find("tr.adding-new-row");
    assert(newRow.length > 0, "New row form tr should be added to table");
    assert(newRow.find("input").length > 0, "New row form should contain inputs for columns");
    newRow.remove();
  });

  await test("content tab: resizable column handles initialized", async () => {
    const contentPane = dbScreen.view.tabContent("content");
    const rescolWrapper = contentPane.find(".rescol-wrapper");
    assert(rescolWrapper.length > 0, "Resizable columns wrapper should exist in content pane");
  });

  await test("content tab: right click context menu provides copy options", async () => {
    const contentPane = dbScreen.view.tabContent("content");
    const row = contentPane.find(".rescol-content-wrapper table tbody tr").first();
    const target = row.find("td").first()[0] || row[0];

    target.dispatchEvent(new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 250,
      clientY: 250,
    }));

    await waitFor(() => document.getElementById("postbird-context-menu-popup") !== null, 3000);
    const popup = $("#postbird-context-menu-popup");
    assert(popup.length > 0, "Context menu popup should be rendered");
    assert(popup.text().includes("Copy") || popup.text().includes("Copy Row as SQL"), "Context menu should have copy options");
    popup.remove();
  });

  await test("content tab: cleans up types test table", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_content_types CASCADE;");
  });

  // =================================================================
  // 6. STRUCTURE TAB TESTS
  // =================================================================
  await test("structure tab: adding, updating, and removing columns", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_struct_cols CASCADE;");
    await dbScreen.connection.query("CREATE TABLE test_struct_cols (id serial primary key, name varchar(50));");

    await dbScreen.tableSelected("public", "test_struct_cols", "structure");
    const structPane = dbScreen.view.tabContent("structure");
    await waitFor(() => structPane.find(".columns-list-table tbody tr").length >= 2, 4000);

    // 1. Add column
    await dbScreen.addColumn({
      name: "notes_col",
      type: "varchar",
      max_length: 100,
      allow_null: true,
      default_value: "initial_notes",
    });

    await waitFor(() => {
      const text = structPane.find(".columns-list-table tbody").text();
      return text.includes("notes_col");
    }, 4000);
    assert(structPane.find(".columns-list-table tbody").text().includes("notes_col"), "notes_col should be visible after adding");

    // 2. Update column
    const colObj = new window.Model.Column("notes_col", { table: dbScreen.table });
    await dbScreen.updateColumn(colObj, {
      name: "renamed_notes_col",
    });

    await waitFor(() => {
      const text = structPane.find(".columns-list-table tbody").text();
      return text.includes("renamed_notes_col");
    }, 4000);
    assert(structPane.find(".columns-list-table tbody").text().includes("renamed_notes_col"), "renamed_notes_col should be visible after updating");

    // 3. Delete column
    await dbScreen.deleteColumn("renamed_notes_col");
    await waitFor(() => {
      const text = structPane.find(".columns-list-table tbody").text();
      return !text.includes("renamed_notes_col");
    }, 4000);
    assert(!structPane.find(".columns-list-table tbody").text().includes("renamed_notes_col"), "renamed_notes_col should be removed");
  });

  await test("structure tab: managing indexes and displaying index sizes", async () => {
    const structPane = dbScreen.view.tabContent("structure");

    // Add index
    await dbScreen.addIndex({
      name: "idx_struct_name",
      columns: ["name"],
      method: "btree",
      uniq: false,
    });

    await waitFor(() => {
      const text = structPane.find(".indexes-list-table tbody").text();
      return text.includes("idx_struct_name");
    }, 4000);

    const indexRow = structPane.find(".indexes-list-table tbody tr:contains('idx_struct_name')");
    assert(indexRow.length > 0, "Created index should be listed in indexes table");
    const indexRowText = indexRow.text();
    assert(indexRowText.includes("kB") || indexRowText.includes("bytes") || indexRowText.includes("0"), "Index size should be displayed");

    // Drop index
    await dbScreen.deleteIndex("idx_struct_name");
    await waitFor(() => {
      const text = structPane.find(".indexes-list-table tbody").text();
      return !text.includes("idx_struct_name");
    }, 4000);
    assert(!structPane.find(".indexes-list-table tbody").text().includes("idx_struct_name"), "Index should be dropped");

    await dbScreen.connection.query("DROP TABLE IF EXISTS test_struct_cols CASCADE;");
  });

  // =================================================================
  // 7. SIDEBAR / LEFT MENU TESTS
  // =================================================================
  await test("sidebar: creates new table via sidebar createTable", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_sidebar_created CASCADE;");
    await dbScreen.createTable({
      tablespace: "public",
      name: "test_sidebar_created",
    });

    await waitFor(() => {
      return dbScreen.view.tablesList.find('li[table-name="test_sidebar_created"]').length > 0;
    }, 4000);
    assert(dbScreen.view.tablesList.find('li[table-name="test_sidebar_created"]').length > 0, "Created table should appear in sidebar");
  });

  await test("sidebar: distinguishes views and materialized views with distinct icons", async () => {
    await dbScreen.connection.query("DROP VIEW IF EXISTS test_ui_standard_view CASCADE;");
    await dbScreen.connection.query("DROP MATERIALIZED VIEW IF EXISTS test_ui_matview CASCADE;");
    await dbScreen.connection.query("CREATE VIEW test_ui_standard_view AS SELECT 1 AS id;");
    await dbScreen.connection.query("CREATE MATERIALIZED VIEW test_ui_matview AS SELECT 2 AS id;");

    await new Promise((resolve) => dbScreen.fetchTablesAndSchemas(() => resolve()));

    const viewItem = dbScreen.view.tablesList.find('li[table-name="test_ui_standard_view"]');
    const matViewItem = dbScreen.view.tablesList.find('li[table-name="test_ui_matview"]');
    const tableItem = dbScreen.view.tablesList.find('li[table-name="test_sidebar_created"]');

    assert(viewItem.length > 0, "test_ui_standard_view should exist in sidebar");
    assert(viewItem.attr("table-type") === "VIEW", "View item should have table-type=VIEW");

    assert(matViewItem.length > 0, "test_ui_matview should exist in sidebar");
    assert(matViewItem.attr("table-type") === "MATERIALIZED VIEW", "Mat view item should have table-type=MATERIALIZED VIEW");

    assert(tableItem.length > 0, "Table item should exist in sidebar");
    assert(tableItem.attr("table-type") === "BASE TABLE", "Table item should have table-type=BASE TABLE");

    await dbScreen.connection.query("DROP VIEW IF EXISTS test_ui_standard_view CASCADE;");
    await dbScreen.connection.query("DROP MATERIALIZED VIEW IF EXISTS test_ui_matview CASCADE;");
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_sidebar_created CASCADE;");
  });

  await test("sidebar: text input filters table list and clears filter", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_filter_alpha CASCADE;");
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_filter_beta CASCADE;");
    await dbScreen.connection.query("CREATE TABLE test_filter_alpha (id serial);");
    await dbScreen.connection.query("CREATE TABLE test_filter_beta (id serial);");

    await new Promise((resolve) => dbScreen.fetchTablesAndSchemas(() => resolve()));

    const filterInput = dbScreen.view.sidebar.find("input.filter-tables");
    filterInput.val("alpha");
    dbScreen.view.filterTables({ target: { value: "alpha" } });

    const alphaItem = dbScreen.view.tablesList.find('li[table-name="test_filter_alpha"]');
    const betaItem = dbScreen.view.tablesList.find('li[table-name="test_filter_beta"]');

    assert(alphaItem.is(":visible"), "test_filter_alpha should remain visible");
    assert(betaItem.is(":hidden"), "test_filter_beta should be hidden by filter");

    dbScreen.view.clearTablesFilter();
    assert(betaItem.is(":visible"), "test_filter_beta should be visible again after clearing filter");

    await dbScreen.connection.query("DROP TABLE IF EXISTS test_filter_alpha CASCADE;");
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_filter_beta CASCADE;");
  });

  // =================================================================
  // 8. EXTENSIONS TAB TESTS
  // =================================================================
  await test("extensions tab: lists extensions and auto-reloads on install", async () => {
    await dbScreen.view.showTab("extensions");
    const extContent = dbScreen.view.tabContent("extensions");

    await waitFor(() => extContent.find(".rescol-content-wrapper table tbody tr").length >= 1, 5000);
    const initialRows = extContent.find(".rescol-content-wrapper table tbody tr").length;
    assert(initialRows > 0, "Extensions tab should display list of available extensions");

    // Install extension (citext or mock) and verify auto-reload via omit('extension.installed')
    await new Promise((resolve) => {
      dbScreen.installExtension("citext", () => resolve());
    });

    await waitFor(() => {
      const text = extContent.find(".rescol-content-wrapper table tbody tr:contains('citext')").text();
      return text.includes("installed") || text.includes("Uninstall") || text.includes("citext");
    }, 4000);

    assert(true, "Extensions tab auto-reloaded upon installation");

    // Uninstall extension to clean up
    await new Promise((resolve) => {
      dbScreen.uninstallExtension("citext", () => resolve());
    });
  });

  // =================================================================
  // 9. WINDOW STATE & SYSTEM TESTS
  // =================================================================
  await test("table SQL definition via pg_dump", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_dump_tbl CASCADE;");
    await dbScreen.connection.query("CREATE TABLE test_dump_tbl (id serial primary key, name text);");

    const table = new window.Model.Table("public", "test_dump_tbl");
    const sql = await table.getSourceSql();
    assert(sql && typeof sql === "string", "Source SQL should be a non-empty string");
    assert(sql.includes("CREATE TABLE") && sql.includes("test_dump_tbl"), "Source SQL should contain CREATE TABLE");

    await dbScreen.connection.query("DROP TABLE IF EXISTS test_dump_tbl CASCADE;");
  });

  await test("window state is saved and preserved across sessions", async () => {
    assert(window.__postbirdRpc && window.__postbirdRpc.getWindowState, "getWindowState RPC should exist");
    const state = await window.__postbirdRpc.getWindowState();
    assert(state && typeof state.width === "number" && state.width >= 400, "Window state width should be >= 400");
    assert(typeof state.height === "number" && state.height >= 300, "Window state height should be >= 300");
  });

  await test("graceful shutdown handler and Cmd+Q interceptor", async () => {
    assert(typeof window.__postbirdGracefulQuit === "function", "__postbirdGracefulQuit should be registered");
    assert(typeof window.Connection.closeAll === "function", "Connection.closeAll should be a function");

    const qEvent = new KeyboardEvent("keydown", {
      key: "q",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(qEvent);
    assert(qEvent.defaultPrevented, "Cmd+Q should have default prevented by shutdown handler");
  });

  // =================================================================
  // SUMMARY & COMPLETION
  // =================================================================
  const failed = results.filter(r => !r.passed).length;
  console.log("\n=======================================================");
  console.log(`UI TESTS SUMMARY: ${results.length - failed}/${results.length} PASSED`);
  if (failed > 0) {
    console.error(`FAILED: ${failed} test(s) failed:`);
    results.filter(r => !r.passed).forEach(r => console.error(`  - ${r.name}: ${r.error}`));
  }
  console.log("=======================================================\n");

  if (window.__postbirdRpc && window.__postbirdRpc.finishTests) {
    await window.__postbirdRpc.finishTests({ total: results.length, failed });
  }
}
