export function buildWebviewTourScript(opts: { demoDb?: string; user?: string } = {}): string {
  const demoDb = JSON.stringify(opts.demoDb || process.env.POSTBIRD_DEMO_DB || "postbird_demo");
  const user = JSON.stringify(opts.user || process.env.POSTBIRD_DEMO_USER || process.env.USER || "postgres");

  return `(() => {
    if (!window.App || !window.App.loginScreen) return;
    if (window.__screenshotTourRunning) return;
    window.__screenshotTourRunning = true;

    const emit = (event, slug) => {
      if (event === "ready") console.log("[screenshot] ready " + slug);
      else if (event === "log") console.log("[screenshot] log " + slug);
      else console.log("[screenshot] " + event);
    };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const waitFor = async (predicate, timeoutMs = 10000, label = "condition") => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        try {
          const val = predicate();
          if (val) return val;
        } catch {}
        await sleep(100);
      }
      throw new Error("Timed out waiting for " + label);
    };

    emit("started");

    (async () => {
      try {
        await sleep(1500);
        emit("ready", "connect");
        await sleep(2500);

        await sleep(8000);
        const conn = new window.Connection();
        const dbScreen = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("connect timed out")), 20000);
          conn.connectToServer({ user: ${user}, host: "localhost", port: 5432, database: ${demoDb} }, (success, err) => {
            clearTimeout(timer);
            if (!success) return reject(err || new Error("Connection failed"));
            try {
              const tab = window.App.addDbScreen(conn, ${demoDb}, {});
              tab.activate();
              resolve(tab.instance);
            } catch (e) {
              reject(e);
            }
          });
        });

        await waitFor(() => dbScreen.view && dbScreen.view.contentPane, 10000, "db screen view");
        await sleep(1500);

        await dbScreen.tableSelected("public", "orders", "content");
        await waitFor(() => document.querySelector(".rescol-content-wrapper table td"), 15000, "rows");
        await sleep(2000);
        emit("ready", "rows");
        await sleep(2500);

        await dbScreen.view.showTab("structure");
        await sleep(2500);
        emit("ready", "structure");
        await sleep(2500);

        await dbScreen.view.showTab("query");
        const queryPane = await waitFor(() => dbScreen.view.queryPane && dbScreen.view.queryPane.editor && dbScreen.view.queryPane, 5000, "query pane");
        queryPane.editor.setValue(
          "SELECT c.full_name, c.country, count(*) AS orders,\\n" +
          "       sum(p.price_cents * o.quantity) / 100.0 AS total\\n" +
          "FROM orders o\\n" +
          "JOIN customers c ON c.id = o.customer_id\\n" +
          "JOIN products p ON p.id = o.product_id\\n" +
          "WHERE o.status <> 'refunded'\\n" +
          "GROUP BY c.full_name, c.country\\n" +
          "ORDER BY total DESC;"
        );
        queryPane.runQuery();
        await waitFor(() => /row|Found|Complete/i.test(queryPane.statusLine.text()), 10000, "query result");
        await sleep(2000);
        emit("ready", "query");
        await sleep(2500);

        await dbScreen.tableSelected("public", "orders", "content");
        await dbScreen.view.showTab("content");
        const badge = await waitFor(() => document.querySelector(".cell-json-badge"), 10000, "json badge");
        badge.click();
        await waitFor(() => document.querySelector(".json-viewer-container, .json-viewer-dialog"), 5000, "json viewer");
        await sleep(2000);
        emit("ready", "json");
        await sleep(2500);

        emit("done");
      } catch (err) {
        emit("log", "error: " + (err && err.message ? err.message : String(err)));
        emit("failed");
      }
    })();
  })()`;
}

export function startScreenshotTour(mainWindow: any): void {
  const script = buildWebviewTourScript();
  let attempts = 0;

  // BrowserView.executeJavascript returns void in Electrobun, so keep retrying
  // briefly until window.App.loginScreen is ready; the script itself guards
  // against running more than once via window.__screenshotTourRunning.
  const tryStart = () => {
    attempts++;
    try {
      mainWindow?.webview?.executeJavascript(script);
    } catch {}
    if (attempts < 20) setTimeout(tryStart, 500);
  };

  setTimeout(tryStart, 1500);
}
