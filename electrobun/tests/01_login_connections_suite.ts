// @ts-nocheck
import type { TestHarness } from "./test_harness";

export async function runLoginConnectionsSuite(h: TestHarness) {
  console.log("\n--- [SUITE 01] Login & Connection Management ---");

  const { assert, waitFor, test, fillInput, clickElement } = h;

  await test("login screen: renders standard and URL form panes via tab clicks", async () => {
    assert(window.App.loginScreen, "App.loginScreen must exist");
    const login = window.App.loginScreen;
    const initialActiveTab = window.App.activeTab;
    window.App.activateLoginTab();

    // Click 'Connect URL' tab link in DOM
    const urlTabLink = login.content.find(".enter-postgres-url");
    assert(urlTabLink.length === 1, "Connect URL tab link must exist");
    await clickElement(urlTabLink[0]);
    assert(login.activeForm === "postgres-url", "Active form should be postgres-url after clicking Connect URL tab");
    assert(login.content.find(".middle-window-content.postgres-url").is(":visible"), "URL form must be visible");

    // Click 'Standard' tab link in DOM
    const stdTabLink = login.content.find(".login-with-password");
    assert(stdTabLink.length === 1, "Standard tab link must exist");
    await clickElement(stdTabLink[0]);
    assert(login.activeForm === "standard", "Active form should be standard after clicking Standard tab");
    assert(login.content.find(".middle-window-content.standard").is(":visible"), "Standard form must be visible");

    if (initialActiveTab !== null && window.App.tabs[initialActiveTab]) {
      window.App.activateTab(initialActiveTab);
    }
  });

  await test("login screen: connects via standard form DOM interaction", async () => {
    const login = window.App.loginScreen;
    login.showStandardPane();

    const initialTabsCount = window.App.tabs.length;
    const form = login.standardForm.form;

    form.find("[name=host]").val("localhost");
    form.find("[name=port]").val("5432");
    form.find("[name=user]").val(window.process.env.USER || "pavel");
    form.find("[name=database]").val("postbird_test");

    let createdTab = null;
    await new Promise((resolve, reject) => {
      window.App.openConnection(login.standardForm.getFormData(), "postbird_test", (tabOrSuccess, err) => {
        if (!tabOrSuccess) return reject(err || new Error("Failed to connect via standard form"));
        createdTab = tabOrSuccess;
        resolve();
      });
    });

    await waitFor(() => window.App.tabs.length > initialTabsCount, 4000);
    assert(window.App.tabs.length > initialTabsCount, "New tab should be added for database session");
    assert(window.App.currentTab.instance.type === "db_screen", "Active tab must be a DbScreen");

    // Close the newly opened tab to return to clean state
    if (createdTab) {
      const idx = window.App.tabs.indexOf(createdTab);
      if (idx !== -1) window.App.closeTab(idx);
    }
  });

  await test("login screen: connects via PostgreSQL connection string form", async () => {
    const login = window.App.loginScreen;
    login.showUrlPane();

    const initialTabsCount = window.App.tabs.length;
    const username = window.process.env.USER || "pavel";
    const testUrl = `postgres://${username}@localhost:5432/postbird_test`;

    login.urlForm.form.find("[name=connect_url]").val(testUrl);

    let createdTab = null;
    await new Promise((resolve, reject) => {
      window.App.openConnection(testUrl, "postbird_test_url", (tabOrSuccess, err) => {
        if (!tabOrSuccess) return reject(err || new Error("Failed to connect via URL string"));
        createdTab = tabOrSuccess;
        resolve();
      });
    });

    await waitFor(() => window.App.tabs.length > initialTabsCount, 4000);
    assert(window.App.tabs.length > initialTabsCount, "New tab should be created from connection string");
    assert(window.App.currentTab.instance.type === "db_screen", "Active tab must be a DbScreen");

    // Clean up created tab
    if (createdTab) {
      const idx = window.App.tabs.indexOf(createdTab);
      if (idx !== -1) window.App.closeTab(idx);
    }
  });

  await test("saved connections: full CRUD lifecycle and sidebar integration", async () => {
    const login = window.App.loginScreen;
    const connName = "E2E_Test_Profile_Alpha";
    const renamedConn = "E2E_Test_Profile_Beta";

    // 1. Create / Save
    window.Model.SavedConn.saveConnection(connName, {
      type: "standard",
      host: "127.0.0.1",
      port: "5432",
      user: "e2e_user",
      database: "e2e_db"
    });

    assert(window.Model.SavedConn.hasConnection(connName), "Connection should be saved in model");
    login.fillSavedConnections();
    assert(login.connections.find(`[data-name='${connName}']`).length === 1, "Connection must render in sidebar list");

    // 2. Read
    const saved = window.Model.SavedConn.savedConnection(connName);
    assert(saved && saved.host === "127.0.0.1", "Saved connection data must match");

    // 3. Rename
    window.Model.SavedConn.renameConnection(connName, renamedConn);
    assert(!window.Model.SavedConn.hasConnection(connName), "Old connection name should not exist");
    assert(window.Model.SavedConn.hasConnection(renamedConn), "Renamed connection must exist");

    login.fillSavedConnections();
    assert(login.connections.find(`[data-name='${renamedConn}']`).length === 1, "Renamed connection must render in sidebar");

    // 4. Delete
    window.Model.SavedConn.removeConnection(renamedConn);
    assert(!window.Model.SavedConn.hasConnection(renamedConn), "Deleted connection must not exist");

    login.fillSavedConnections();
    assert(login.connections.find(`[data-name='${renamedConn}']`).length === 0, "Deleted connection must be removed from sidebar");
  });

  await test("login screen: handles connection failure and cancelable loading state", async () => {
    // 1. Connection error handling with invalid port
    let connectionFailed = false;
    await new Promise((resolve) => {
      window.App.openConnection({ host: "localhost", port: 54399, database: "non_existent_db" }, "failing_conn", (success) => {
        if (!success) connectionFailed = true;
        resolve();
      });
    });
    assert(connectionFailed, "Connection to invalid port 54399 should return false");

    // 2. Cancelable loading modal
    let cancelCalled = false;
    window.App.startLoading("Testing cancellation...", 0, {
      cancel: () => {
        cancelCalled = true;
        window.App.stopLoading();
      }
    });

    assert(window.App.loader, "App loader should be active");
    window.App.loader.find("a.cancel-btn").trigger("click");

    await waitFor(() => cancelCalled && !window.App.loader, 2000);
    assert(cancelCalled, "Cancel callback should be invoked");
    assert(!window.App.loader, "Loader should be dismissed after cancellation");
  });

  // =================================================================
  // 5. SSH Tunnel Bridge & Persistent Profile Storage
  // =================================================================
  await test("login screen: verifies SSH tunnel RPC bridge and error handling", async () => {
    assert(window.__postbirdRpc && typeof window.__postbirdRpc.createSshTunnel === "function", "createSshTunnel RPC should be exposed");
    assert(window.__postbirdRpc && typeof window.__postbirdRpc.closeSshTunnel === "function", "closeSshTunnel RPC should be exposed");

    // Attempt connecting through an unreachable SSH port to verify error response
    const res = await window.__postbirdRpc.createSshTunnel({
      options: {
        ssh_host: "127.0.0.1",
        ssh_port: 54398,
        ssh_user: "nonexistent",
        host: "localhost",
        port: 5432,
      }
    });

    assert(res.error, "Unreachable SSH host should return descriptive error");
    assert(res.tunnelId === "", "Failed tunnel should return empty tunnelId");

    // Test persistent saved connection sync via RPC
    const profileSync = await window.__postbirdRpc.loadSavedConnections();
    assert(profileSync && typeof profileSync.connections === "object", "loadSavedConnections should return connections object");
  });

  await test("login screen: aligns button row with Test Connection on left and Save/Connect on right", async () => {
    const login = window.App.loginScreen;
    login.showStandardPane();
    login.addNewConnection();

    const buttonsContainer = login.standardForm.form.find(".buttons");
    assert(buttonsContainer.length === 1, ".buttons container must exist");
    assert(buttonsContainer.find(".buttons-left button[exec='std_testConnection']").length === 1, "Test Connection must be inside .buttons-left");
    assert(buttonsContainer.find(".buttons-right button[exec='std_saveAndConnect']").length === 1, "Save & Connect must be inside .buttons-right");
    assert(buttonsContainer.find(".buttons-right input[type='submit']").length === 1, "Connect submit button must be inside .buttons-right");

    // Verify tunnel options text and toggle behavior
    const tunnelLink = login.content.find(".open-extra-fields");
    assert(tunnelLink.text().includes("Connect via SSH Tunnel"), "Tunnel toggle text should read 'Connect via SSH Tunnel'");

    // Test expanding and collapsing SSH tunnel options
    assert(!login.content.find(".middle-window").hasClass("extra-login-fields-open"), "Should start collapsed");
    await clickElement(tunnelLink[0]);
    assert(login.content.find(".middle-window").hasClass("extra-login-fields-open"), "Clicking should toggle extra-login-fields-open");
    assert(login.content.find(".extra-field").first().is(":visible"), "SSH extra fields should be visible when opened");

    const closeTunnelLink = login.content.find(".close-extra-fields");
    assert(closeTunnelLink.text().includes("Hide SSH Tunnel options"), "Close toggle text should read 'Hide SSH Tunnel options'");
    await clickElement(closeTunnelLink[0]);
    assert(!login.content.find(".middle-window").hasClass("extra-login-fields-open"), "Clicking close should collapse extra fields");

    // Verify inputs have autocapitalize, autocorrect, and spellcheck disabled
    const sshUserInput = login.content.find("#ssh_user");
    assert(sshUserInput.attr("autocapitalize") === "none", "SSH User input should have autocapitalize='none'");
    assert(sshUserInput.attr("autocorrect") === "off", "SSH User input should have autocorrect='off'");
    assert(sshUserInput.attr("spellcheck") === "false", "SSH User input should have spellcheck='false'");

    const hostInput = login.content.find("#login_host");
    assert(hostInput.attr("autocapitalize") === "none", "Host input should have autocapitalize='none'");
    assert(hostInput.attr("autocorrect") === "off", "Host input should have autocorrect='off'");
  });
}
