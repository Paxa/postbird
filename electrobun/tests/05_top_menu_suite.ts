// @ts-nocheck
import type { TestHarness } from "./test_harness";

function findMenuItem(topLabel: string, subLabel: string) {
  const menu = (window as any).topMenu || ((window as any).remote && (window as any).remote.Menu.getApplicationMenu());
  if (!menu || !menu.items) return null;
  const top = menu.items.find((item: any) => item.label === topLabel);
  if (!top || !top.submenu || !top.submenu.items) return null;
  return top.submenu.items.find((sub: any) => sub.label === subLabel);
}

export async function runTopMenuSuite(h: TestHarness, dbScreen: any) {
  console.log("\n--- [SUITE 05] Top Menu Navigation, Actions & Dynamic State ---");

  const { assert, waitFor, test, clickElement, waitForDialog, closeCurrentDialog } = h;

  // =================================================================
  // 1. Dynamic Enablement: Disabled on Connection tab vs Enabled on DB tab
  // =================================================================
  await test("top menu: reflects dynamic enable/disable states based on database context", async () => {
    assert((window as any).topMenu, "Top menu instance must exist");

    // 1. Switch to Connection/Login tab
    const dbTabIndex = window.App.tabs.findIndex(t => t.instance === dbScreen);
    window.App.activateLoginTab();

    // In login tab, database and table actions must be disabled
    const disconnectedClients = findMenuItem("Database", "Show Connected Clients");
    const disconnectedExport = findMenuItem("Database", "Export Database");
    const disconnectedDrop = findMenuItem("Database", "Drop Database");
    const disconnectedReload = findMenuItem("Table", "Reload");

    assert(disconnectedClients && !disconnectedClients.enabled, "Show Connected Clients should be disabled on connection tab");
    assert(disconnectedExport && !disconnectedExport.enabled, "Export Database should be disabled on connection tab");
    assert(disconnectedDrop && !disconnectedDrop.enabled, "Drop Database should be disabled on connection tab");
    assert(disconnectedReload && !disconnectedReload.enabled, "Table Reload should be disabled on connection tab");

    // 2. Switch back to DB session tab
    if (dbTabIndex >= 0) {
      window.App.activateTab(dbTabIndex);
    }

    // Now connected to a valid database: actions must be dynamically enabled
    const connectedClients = findMenuItem("Database", "Show Connected Clients");
    const connectedCreate = findMenuItem("Database", "Create Database");
    const connectedExport = findMenuItem("Database", "Export Database");
    const connectedRefresh = findMenuItem("Database", "Refresh Database");

    assert(connectedClients && connectedClients.enabled, "Show Connected Clients should be enabled on connected DB tab");
    assert(connectedCreate && connectedCreate.enabled, "Create Database should be enabled on connected DB tab");
    assert(connectedExport && connectedExport.enabled, "Export Database should be enabled on connected DB tab");
    assert(connectedRefresh && connectedRefresh.enabled, "Refresh Database should be enabled on connected DB tab");

    // 3. Switch to Query tab -> Table -> Reload must be enabled
    await dbScreen.view.showTab("query");
    const queryReload = findMenuItem("Table", "Reload");
    assert(queryReload && queryReload.enabled, "Table Reload should be enabled in Query tab");
  });

  // =================================================================
  // 2. File -> New Connection
  // =================================================================
  await test("top menu: 'File -> New Connection' switches to connection login screen", async () => {
    const newConnItem = findMenuItem("File", "New Connection");
    assert(newConnItem && typeof newConnItem.click === "function", "File -> New Connection menu item must exist");

    const dbTabIndex = window.App.activeTab;
    newConnItem.click();

    await waitFor(() => window.App.activeTab === window.App.tabs.findIndex(t => t.instance instanceof (window as any).LoginScreen), 2000);
    assert(window.App.currentTab.name === "Connection", "New Connection menu action must activate Connection tab");

    // Restore DB session tab
    if (dbTabIndex !== null && window.App.tabs[dbTabIndex]) {
      window.App.activateTab(dbTabIndex);
    }
  });

  // =================================================================
  // 3. Database -> Show Connected Clients
  // =================================================================
  await test("top menu: 'Database -> Show Connected Clients' opens active clients modal", async () => {
    const clientsItem = findMenuItem("Database", "Show Connected Clients");
    assert(clientsItem && typeof clientsItem.click === "function", "Database -> Show Connected Clients item must exist");

    clientsItem.click();

    const dlg = await waitForDialog("connection-list", 4000);
    assert(dlg, "Connected clients dialog should appear");

    await waitFor(() => dlg.querySelector("table tbody tr"), 4000);
    const table = dlg.querySelector("table tbody");
    assert(table && table.children.length > 0, "Connected clients table should display active connections");

    await closeCurrentDialog();
  });

  // =================================================================
  // 4. Database -> Create Database
  // =================================================================
  await test("top menu: 'Database -> Create Database' triggers new database modal", async () => {
    const createDbItem = findMenuItem("Database", "Create Database");
    assert(createDbItem && typeof createDbItem.click === "function", "Database -> Create Database item must exist");

    createDbItem.click();

    const dlg = await waitForDialog("new-database", 5000);
    assert(dlg, "New database dialog must appear");
    assert(dlg.querySelector("input[name=dbname]"), "New database dialog should contain database name input");

    await closeCurrentDialog();
  });

  // =================================================================
  // 5. Database -> Refresh Database
  // =================================================================
  await test("top menu: 'Database -> Refresh Database' invalidates cache and updates sidebar", async () => {
    const refreshItem = findMenuItem("Database", "Refresh Database");
    assert(refreshItem && typeof refreshItem.click === "function", "Database -> Refresh Database item must exist");

    // Create a temporary table
    await dbScreen.connection.query("DROP TABLE IF EXISTS e2e_menu_refresh_test CASCADE;");
    await dbScreen.connection.query("CREATE TABLE e2e_menu_refresh_test (id serial);");

    // Trigger refresh from top menu
    refreshItem.click();

    await waitFor(() => {
      const item = dbScreen.view.tablesList.find('li[table-name="e2e_menu_refresh_test"]');
      return item.length > 0;
    }, 4000);

    const tableItem = dbScreen.view.tablesList.find('li[table-name="e2e_menu_refresh_test"]');
    assert(tableItem.length > 0, "Sidebar tables list must display newly created table after menu refresh");

    // Clean up
    await dbScreen.connection.query("DROP TABLE IF EXISTS e2e_menu_refresh_test CASCADE;");
    refreshItem.click();
  });

  // =================================================================
  // 6. Table -> Reload (in query pane)
  // =================================================================
  await test("top menu: 'Table -> Reload' re-runs query when on query pane", async () => {
    await dbScreen.view.showTab("query");
    const queryPane = dbScreen.view.queryPane;
    await waitFor(() => queryPane && queryPane.editor, 3000);

    queryPane.cleanResult();
    const testVal = 999111;
    queryPane.editor.setValue(`SELECT ${testVal} AS menu_reload_check;`);

    const reloadItem = findMenuItem("Table", "Reload");
    assert(reloadItem && typeof reloadItem.click === "function", "Table -> Reload item must exist");

    reloadItem.click();

    await waitFor(() => {
      const statusText = queryPane.statusLine.text();
      return queryPane.button.text() !== "Running..." && (statusText.includes("Found") || statusText.includes("row") || statusText.includes("Complete"));
    }, 5000);

    const resultText = queryPane.content.find(".result").text();
    assert(resultText.includes("999111"), "Query result should contain reloaded query value");
  });

  // =================================================================
  // 7. Help -> Postbird Help
  // =================================================================
  await test("top menu: 'Help -> Postbird Help' opens help tab and activates get-postgres page", async () => {
    const existingHelpIdx = window.App.tabs.findIndex(t => t.instance === window.App.helpScreen);
    if (existingHelpIdx >= 0) {
      window.App.closeTab(existingHelpIdx);
    }

    const helpMenuItem = findMenuItem("Help", "Postbird Help");
    assert(helpMenuItem && typeof helpMenuItem.click === "function", "Help -> Postbird Help item must exist");

    helpMenuItem.click();

    await waitFor(() => window.App.helpScreenOpen(), 3000);
    assert(window.App.helpScreenOpen(), "Postbird Help menu action should open Help tab");

    const helpInstance = (window as any).App.helpScreen;
    assert(helpInstance, "HelpScreen instance should exist");

    const getPgContent = helpInstance.content.find(".page.get-postgres");
    assert(getPgContent.css("display") !== "none", "Postbird Help should navigate to get-postgres page");

    // Close help tab
    const helpTabIndex = window.App.tabs.findIndex(t => t.instance === helpInstance);
    if (helpTabIndex >= 0) {
      window.App.closeTab(helpTabIndex);
    }
  });

  // =================================================================
  // 8. Window -> Close Tab (with last tab guard)
  // =================================================================
  await test("top menu: 'Window -> Close Tab' closes active tab with safety guard", async () => {
    const closeTabItem = findMenuItem("Window", "Close Tab");
    assert(closeTabItem && typeof closeTabItem.click === "function", "Window -> Close Tab item must exist");

    // Open an additional tab and activate it
    const helpTab = window.App.addHelpScreen();
    helpTab.activate();
    const tabsCountWithExtra = window.App.tabs.length;

    // Simulate clicking Close Tab on focused window
    const mockWindow = (window as any).App.remote.getCurrentWindow();
    mockWindow.webContents.getURL = () => "index.html";

    closeTabItem.click(null, mockWindow);

    await waitFor(() => window.App.tabs.length === tabsCountWithExtra - 1, 2000);
    assert(window.App.tabs.length === tabsCountWithExtra - 1, "Close Tab should close the active tab");

    // Safety guard test: when only connection tab is active, closing should not remove it
    window.App.activateLoginTab();
    const loginTabsCount = window.App.tabs.length;
    closeTabItem.click(null, mockWindow);

    assert(window.App.tabs.length === loginTabsCount, "Close Tab should NOT close the root Connection tab");

    // Return to DB tab
    const dbTabIndex = window.App.tabs.findIndex(t => t.instance === dbScreen);
    if (dbTabIndex >= 0) {
      window.App.activateTab(dbTabIndex);
    }
  });
}
