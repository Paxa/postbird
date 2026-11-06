// @ts-nocheck
import type { TestHarness } from "./test_harness";

export async function runDialogsAndToolsSuite(h: TestHarness, dbScreen: any) {
  console.log("\n--- [SUITE 03] Modal Dialogs, Utilities & Help Screen ---");

  const { assert, waitFor, test, fillInput, clickElement, waitForDialog, closeCurrentDialog } = h;

  // =================================================================
  // 1. New Database Dialog
  // =================================================================
  await test("dialogs: new database dialog loads templates and encodings", async () => {
    new window.Dialog.NewDatabase(dbScreen);
    const dlg = await waitForDialog("new-database", 5000);
    assert(dlg, "New Database dialog must appear");

    await waitFor(() => {
      const encSelect = dlg.querySelector("select.encoding");
      return encSelect && encSelect.options.length > 0;
    }, 3000);

    const encSelect = dlg.querySelector("select.encoding");
    assert(encSelect.options.length > 0, "Database encodings should be loaded");
    assert(dlg.querySelector("input[name=dbname]"), "Database name input must exist");

    await closeCurrentDialog();
  });

  // =================================================================
  // 2. Export File Dialog
  // =================================================================
  await test("dialogs: export options dialog renders checkboxes and file path", async () => {
    let submittedOptions = null;
    const exportDlg = new window.Dialog.ExportFile(dbScreen, (file, options) => {
      submittedOptions = { file, options };
    });

    const dlg = await waitForDialog("export-file-dialog", 3000);
    assert(dlg, "Export file dialog must appear");

    const structCb = dlg.querySelector("input[name=export_structure]") as HTMLInputElement;
    const dataCb = dlg.querySelector("input[name=export_data]") as HTMLInputElement;
    const fileInput = dlg.querySelector("input[name=export_to_file]") as HTMLInputElement;

    assert(structCb && structCb.checked, "Export structure should be checked by default");
    assert(dataCb && dataCb.checked, "Export data should be checked by default");

    // Test form validation: uncheck both
    structCb.checked = false;
    dataCb.checked = false;
    const alertCalls = [];
    const origAlert = window.alert;
    window.alert = (msg) => alertCalls.push(msg);

    exportDlg.onSubmit({});
    assert(alertCalls.length > 0, "Alert should fire if neither structure nor data is selected");
    window.alert = origAlert;

    await closeCurrentDialog();
  });

  // =================================================================
  // 3. Import File Dialog
  // =================================================================
  await test("dialogs: import file dialog renders database selector", async () => {
    new window.Dialog.ImportFile(
      dbScreen,
      "/tmp/sample_dataset.sql",
      ["postbird_test", "postgres"],
      "postbird_test",
      () => {}
    );

    const dlg = await waitForDialog("import-file-dialog", 3000);
    assert(dlg, "Import file dialog must open");

    const dbSelect = dlg.querySelector("select[name=database]") as HTMLSelectElement;
    assert(dbSelect && dbSelect.options.length >= 2, "Import dialog should list available databases");
    assert(dbSelect.value === "postbird_test", "Current database should be pre-selected");

    await closeCurrentDialog();
  });

  // =================================================================
  // 4. Show SQL Preview Dialog
  // =================================================================
  await test("dialogs: show SQL preview modal renders formatted code", async () => {
    const testSql = "ALTER TABLE test_preview ADD COLUMN preview_col integer NOT NULL DEFAULT 42;";
    new window.Dialog.ShowSql(testSql);

    const dlg = await waitForDialog("show-sql-dialog", 3000);
    assert(dlg, "Show SQL dialog must open");
    assert(dlg.textContent.includes("ALTER TABLE test_preview"), "Show SQL dialog must display provided code");

    await closeCurrentDialog();
  });

  // =================================================================
  // 5. Help & About Postbird Screen
  // =================================================================
  await test("help screen: opens Help tab, navigates pages, and displays runtime info", async () => {
    const existingHelpIdx = window.App.tabs.findIndex(t => t.instance === window.App.helpScreen);
    if (existingHelpIdx >= 0) {
      window.App.closeTab(existingHelpIdx);
    }
    const initialTabsCount = window.App.tabs.length;
    const helpInstance = window.HelpScreen.open();

    assert(window.App.helpScreenOpen(), "App.helpScreenOpen() should return true");
    assert(window.App.tabs.length > initialTabsCount, "Help tab should be added to tabs bar");

    // Verify About page is default and renders Electrobun runtime
    helpInstance.activatePage("about-postbird");
    const aboutContent = helpInstance.content.find(".page.about-postbird");
    assert(aboutContent.css("display") !== "none", "About page should be initially visible");
    assert(aboutContent.text().includes("Electrobun"), "About page text should mention Electrobun runtime");

    // Switch to get-postgres page
    helpInstance.activatePage("get-postgres");
    const getPgContent = helpInstance.content.find(".page.get-postgres");
    assert(getPgContent.is(":visible"), "get-postgres page should become visible");

    // Close Help tab
    const helpTabIndex = window.App.tabs.findIndex(t => t.instance === helpInstance);
    if (helpTabIndex >= 0) {
      window.App.closeTab(helpTabIndex);
    }
    assert(!window.App.helpScreenOpen(), "Help tab should be closed");
  });

  // =================================================================
  // 6. SQL Snippets Library
  // =================================================================
  await test("snippets: library loads built-in snippets and manages custom items", async () => {
    assert(window.SqlSnippets, "SqlSnippets global dictionary must exist");
    assert(window.SqlSnippets["Show Running Queries"], "Built-in 'Show Running Queries' snippet should exist");
    assert(window.SqlSnippets["Create View"], "Built-in 'Create View' snippet should exist");

    // Register a custom snippet
    const customKey = "E2E_Custom_Snippet_Test";
    window.SqlSnippets[customKey] = {
      sql: "SELECT 8888 AS e2e_custom_val;",
      description: "Custom E2E snippet description"
    };

    assert(window.SqlSnippets[customKey], "Custom snippet must be added");
    assert(window.SqlSnippets[customKey].sql.includes("8888"), "Custom snippet SQL must match");

    delete window.SqlSnippets[customKey];
    assert(!window.SqlSnippets[customKey], "Custom snippet should be deleted");
  });

  // =================================================================
  // 7. SQL Console & Event History In-App Modal (HistoryWindow)
  // =================================================================
  await test("history window: opens in-app macOS modal, renders events, and streams updates", async () => {
    assert(window.HistoryWindow, "HistoryWindow class should be available globally");

    new window.HistoryWindow();
    const dlg = await waitForDialog("history-dialog", 3000);
    assert(dlg, "History modal dialog should open");
    assert(window.App.historyWin, "App.historyWin should be set while modal is open");

    // Verify header controls
    assert(dlg.querySelector(".reload-btn"), "Reload button should be present in history header");
    assert(dlg.querySelector(".clear-btn"), "Clear button should be present in history header");
    assert(dlg.querySelector(".close-history-btn"), "Close button should be present in history header");

    // Emit a log message and verify live streaming
    window.App.emit("log.message", {
      type: "sql.success",
      time: Date.now(),
      args: [{ sql: "SELECT 777888 AS e2e_history_check;", time: 2 }],
    });

    await waitFor(() => {
      const activeDlg = document.querySelector("#alertify.history-dialog");
      return activeDlg && activeDlg.textContent.includes("777888");
    }, 2000);

    const updatedDlg = document.querySelector("#alertify.history-dialog");
    assert(updatedDlg && updatedDlg.textContent.includes("777888"), "History modal should stream live SQL execution events");

    // Close modal
    if (window.App.historyWin) {
      window.App.historyWin.close();
    }
    await waitFor(() => !document.querySelector("#alertify.history-dialog"), 2000);
    assert(!window.App.historyWin, "App.historyWin should be cleared after close");
  });

  // =================================================================
  // 8. Native Electrobun RPC File Pickers & Write Persistence
  // =================================================================
  await test("rpc: dialog shims and fs stream write route to native host bridge", async () => {
    assert(window.__postbirdRpc, "Host RPC bridge (__postbirdRpc) must be initialized");
    assert(typeof window.__postbirdRpc.openFileDialog === "function", "openFileDialog RPC method must exist");
    assert(typeof window.__postbirdRpc.saveFileDialog === "function", "saveFileDialog RPC method must exist");
    assert(typeof window.__postbirdRpc.writeFile === "function", "writeFile RPC method must exist");
    assert(typeof window.__postbirdRpc.openExternal === "function", "openExternal RPC method must exist");

    // Test remote.shell.openExternal routing
    let extUrl = "";
    const origOpenExternal = window.__postbirdRpc.openExternal;
    window.__postbirdRpc.openExternal = async (params) => {
      extUrl = params.url;
      return { success: true };
    };
    const remote = require("@electron/remote");
    remote.shell.openExternal("https://www.postgresql.org/docs/");
    assert(extUrl === "https://www.postgresql.org/docs/", "remote.shell.openExternal should route to host RPC");
    window.__postbirdRpc.openExternal = origOpenExternal;

    // Test fs createWriteStream write persistence
    const fs = require("fs");
    let savedFilePath = "";
    let savedFileContent = "";
    const origWriteFile = window.__postbirdRpc.writeFile;
    window.__postbirdRpc.writeFile = async (params) => {
      savedFilePath = params.filePath;
      savedFileContent = params.content;
      return { success: true };
    };

    const stream = fs.createWriteStream("/tmp/e2e_query_export.csv");
    stream.write("col_a,col_b\n");
    await new Promise<void>((resolve) => {
      stream.end("100,200\n", () => resolve());
    });

    assert(savedFilePath === "/tmp/e2e_query_export.csv", "fs stream write must persist target path to host");
    assert(savedFileContent.includes("100,200"), "fs stream write must persist contents to host");
    window.__postbirdRpc.writeFile = origWriteFile;
  });
}
