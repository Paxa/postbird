// @ts-nocheck
import type { TestHarness } from "./test_harness";

export async function runMultitabShortcutsSuite(h: TestHarness, dbScreen: any) {
  console.log("\n--- [SUITE 04] Multi-Tab Concurrency, Shortcuts & Error Highlighting ---");

  const { assert, waitFor, test, fillInput, clickElement } = h;

  // =================================================================
  // 1. Multi-Tab Concurrency & Session Isolation
  // =================================================================
  await test("multi-tab: supports concurrent independent database sessions", async () => {
    const initialTabsCount = window.App.tabs.length;

    let tab2 = null;
    await new Promise((resolve, reject) => {
      const conn2 = new window.Connection();
      conn2.connectToServer({
        user: window.process.env.USER || "pavel",
        host: "localhost",
        port: 5432,
        database: "postbird_test",
      }, (success, err) => {
        if (!success) return reject(err || new Error("Failed to connect 2nd session"));
        tab2 = window.App.addDbScreen(conn2, "postbird_test_concurrent", {});
        tab2.activate();
        resolve();
      });
    });

    assert(window.App.tabs.length === initialTabsCount + 1, "Tabs count should increment by 1");
    assert(window.App.currentTab === tab2, "Tab 2 must become the active tab");

    // Execute isolated query in Tab 2
    const res2 = await tab2.instance.connection.query("SELECT 20202 AS tab2_val;");
    assert(res2.rows[0].tab2_val === 20202, "Tab 2 query result must match");

    // Switch back to Tab 1
    const tab1 = window.App.tabs.find(t => t.instance === dbScreen || (t.instance && t.instance.type === "db_screen" && t !== tab2));
    assert(tab1, "Tab 1 should be found in tabs list");
    tab1.activate();
    assert(window.App.currentTab === tab1, "Tab 1 must become active again");

    // Execute isolated query in Tab 1
    const res1 = await dbScreen.connection.query("SELECT 10101 AS tab1_val;");
    assert(res1.rows[0].tab1_val === 10101, "Tab 1 query result must match");

    // Close Tab 2 and assert clean return to Tab 1
    const tab2Index = window.App.tabs.indexOf(tab2);
    window.App.closeTab(tab2Index);

    assert(window.App.tabs.length === initialTabsCount, "Tabs count should restore to initial count");
    assert(window.App.currentTab === tab1, "Tab 1 should remain active and connected");
  });

  // =================================================================
  // 2. Query Editor Inline Syntax Error Handling
  // =================================================================
  await test("query editor: catches syntax error and displays inline error message", async () => {
    await dbScreen.view.showTab("query");
    const queryPane = dbScreen.view.queryPane;

    const invalidSql = "SELEC * FORM definitely_invalid_syntax_table_404;";
    queryPane.editor.setValue(invalidSql);

    queryPane.runQuery();

    await waitFor(() => {
      const statusText = queryPane.statusLine.text();
      return statusText.toLowerCase().includes("syntax error") || statusText.toLowerCase().includes("selec");
    }, 4000);

    const errorMsg = queryPane.statusLine.text();
    assert(errorMsg.toLowerCase().includes("syntax error") || errorMsg.includes("SELEC"), "Status line must display PostgreSQL syntax error");

    // Verify stale result grid is cleared
    const resultRows = queryPane.content.find(".result .rescol-wrapper table tbody tr");
    assert(resultRows.length === 0, "Result table rows must be cleared on query error");
  });

  // =================================================================
  // 3. Interactive Sidebar Resizing
  // =================================================================
  await test("sidebar: interactive drag handler resizes sidebar and main view", async () => {
    const sidebar = dbScreen.view.content.find(".sidebar");
    const mainbar = dbScreen.view.content.find(".main");
    const resizeHandler = dbScreen.view.content.find(".resize-handler");

    assert(sidebar.length > 0, "Sidebar should exist");
    assert(mainbar.length > 0, "Main bar should exist");
    assert(resizeHandler.length > 0, "Resize handler element should exist");

    // Trigger sidebar resize tracking
    dbScreen.view.sidebarResizer.onChanged({ pageX: 280 });

    await waitFor(() => sidebar[0].style.width === "280px", 2000);
    assert(sidebar[0].style.width === "280px", "Sidebar width should resize to 280px");
    assert(mainbar[0].style.marginLeft === "280px", "Main bar margin should adjust to 280px");
  });
}
