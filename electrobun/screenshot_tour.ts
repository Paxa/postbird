// @ts-nocheck
// Dev-only scene runner for the Mac App Store screenshots.
// Enabled by POSTBIRD_SCREENSHOT_TOUR=true (see electrobun/main.ts). It connects
// to a local demo database, walks through five scenes and logs
// "[screenshot] ready <slug>" after each one so scripts/appstore/capture_screenshots.ts
// can grab the window. Normal runs never load this file.

const log = (msg: string) => window.__postbirdRpc.screenshotEvent({ event: "log", slug: msg });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(predicate: () => any, timeoutMs = 10000, label = "condition") {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const value = predicate();
      if (value) return value;
    } catch (_) {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function ready(slug: string) {
  return window.__postbirdRpc.screenshotEvent({ event: "ready", slug });
}

export async function runScreenshotTour() {
  const demoDb = window.process.env.POSTBIRD_DEMO_DB || "postbird_demo";
  const user = window.process.env.USER || "postgres";
  try {
    // Scene 1: the connection screen, before anything is connected.
    await waitFor(() => window.App && window.App.loginScreen, 15000, "login screen");
    await sleep(1500);
    await ready("connect");
    await sleep(2500);

    await log("after connect scene");
    // Connect to the demo database.
    await log("typeof Connection=" + typeof window.Connection + " user=" + user);
    // Connecting in the first seconds after launch hangs (Bun.SQL pool never gets a reply), so wait.
    await sleep(8000);
    const conn = new window.Connection();
    const dbScreen = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("connect timed out")), 20000);
      conn.connectToServer({ user, host: "localhost", port: 5432, database: demoDb }, (success, err) => {
        clearTimeout(timer);
        if (!success) return reject(err || new Error("Connection failed"));
        try {
          const tab = window.App.addDbScreen(conn, demoDb, {});
          tab.activate();
          resolve(tab.instance);
        } catch (e) {
          reject(e);
        }
      });
    });
    await waitFor(() => dbScreen.view && dbScreen.view.contentPane, 10000, "db screen view");
    await sleep(1500);

    await log("db view ready");
    // Scene 2: table rows.
    await dbScreen.tableSelected("public", "orders", "content");
    await waitFor(() => document.querySelector(".rescol-content-wrapper table td"), 15000, "rows");
    await sleep(2000);
    await ready("rows");
    await sleep(2500);

    await log("rows shown");
    // Scene 3: structure.
    await dbScreen.view.showTab("structure");
    await sleep(2500);
    await ready("structure");
    await sleep(2500);

    await log("structure shown");
    // Scene 4: query and results.
    await dbScreen.view.showTab("query");
    const queryPane = await waitFor(() => dbScreen.view.queryPane && dbScreen.view.queryPane.editor && dbScreen.view.queryPane, 5000, "query pane");
    queryPane.editor.setValue(
      "SELECT c.full_name, c.country, count(*) AS orders,\n" +
      "       sum(p.price_cents * o.quantity) / 100.0 AS total\n" +
      "FROM orders o\n" +
      "JOIN customers c ON c.id = o.customer_id\n" +
      "JOIN products p ON p.id = o.product_id\n" +
      "WHERE o.status <> 'refunded'\n" +
      "GROUP BY c.full_name, c.country\n" +
      "ORDER BY total DESC;"
    );
    queryPane.runQuery();
    await waitFor(() => /row|Found|Complete/i.test(queryPane.statusLine.text()), 10000, "query result");
    await sleep(2000);
    await ready("query");
    await sleep(2500);

    await log("query done");
    // Scene 5: JSON cell viewer.
    await dbScreen.tableSelected("public", "orders", "content");
    await dbScreen.view.showTab("content");
    await log("content tab shown");
    const badge = await waitFor(() => document.querySelector(".cell-json-badge"), 10000, "json badge");
    badge.click();
    await waitFor(() => document.querySelector(".json-viewer-container, .json-viewer-dialog"), 5000, "json viewer");
    await sleep(2000);
    await ready("json");
    await sleep(2500);

    await window.__postbirdRpc.screenshotEvent({ event: "done" });
  } catch (err) {
    await log("error: " + (err && err.message ? err.message : String(err)));
    await window.__postbirdRpc.screenshotEvent({ event: "failed" });
  }
}
