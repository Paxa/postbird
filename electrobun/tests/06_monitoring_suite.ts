// @ts-nocheck
import type { TestHarness } from "./test_harness";

export async function runMonitoringSuite(h: TestHarness, dbScreen: any) {
  console.log("\n--- [SUITE 06] Real-Time Monitoring Dashboard (macOS Native Accordion & Sparklines) ---");

  const { assert, waitFor, test } = h;

  // =================================================================
  // 1. Tab Navigation & Initial Render
  // =================================================================
  await test("monitoring tab: opens and activates macOS monitoring pane", async () => {
    await dbScreen.view.showTab("monitoring");
    const monitoringPane = dbScreen.view.monitoringPane;

    await waitFor(() => monitoringPane && monitoringPane.content && monitoringPane.content.length > 0, 4000);
    assert(dbScreen.view.currentTab === "monitoring", "Current tab should be 'monitoring'");

    const tabBtn = dbScreen.view.topTabs.filter(".monitoring");
    assert(tabBtn.hasClass("active"), "Top tab button for monitoring should have 'active' class");

    const contentPane = dbScreen.view.tabContents.filter(".monitoring");
    assert(contentPane.hasClass("active"), "Monitoring content pane should have 'active' class");
  });

  // =================================================================
  // 2. Default Accordion Section States & KPI Cards
  // =================================================================
  await test("monitoring tab: verifies foldable disclosure sections and default state", async () => {
    const monitoringPane = dbScreen.view.monitoringPane;
    const content = monitoringPane.content;

    // Check all 5 sections exist
    const sections = content.find(".monitor-section");
    assert(sections.length === 5, "Should render exactly 5 grouped monitoring sections");

    const overviewSec = content.find('.monitor-section[data-section="overview"]');
    assert(overviewSec.hasClass("expanded"), "Overview section must be expanded by default");

    const storageSec = content.find('.monitor-section[data-section="storage"]');
    assert(!storageSec.hasClass("expanded"), "Storage section should start collapsed");

    const vacuumSec = content.find('.monitor-section[data-section="vacuum"]');
    assert(!vacuumSec.hasClass("expanded"), "Vacuum section should start collapsed");

    const repSec = content.find('.monitor-section[data-section="replication"]');
    assert(!repSec.hasClass("expanded"), "Replication section should start collapsed");

    // Wait for overview metrics to populate
    await waitFor(() => monitoringPane.overviewData !== null, 4000);

    const connsVal = overviewSec.find(".metric-conns-val").text();
    assert(connsVal.includes("/"), "Total connections KPI should display current/max");

    const cacheVal = overviewSec.find(".metric-cache-val").text();
    assert(cacheVal.includes("%"), "Buffer cache hit ratio KPI should display percentage");
  });

  // =================================================================
  // 3. Dual SVG Sparkline Charts
  // =================================================================
  await test("monitoring tab: renders responsive SVG sparkline charts for throughput and latency", async () => {
    const monitoringPane = dbScreen.view.monitoringPane;
    const content = monitoringPane.content;

    const qpsSvg = content.find(".chart-container-qps svg");
    assert(qpsSvg.length > 0, "Throughput QPS chart should render valid SVG markup");

    const latencySvg = content.find(".chart-container-latency svg");
    assert(latencySvg.length > 0, "Query Latency chart should render valid SVG markup");

    assert(qpsSvg.hasClass("macos-sparkline-svg"), "Chart should carry macos-sparkline-svg class");
  });

  // =================================================================
  // 4. Live Polling Toggle and Header Badges
  // =================================================================
  await test("monitoring tab: controls live polling toggle and updates pulse indicators", async () => {
    const monitoringPane = dbScreen.view.monitoringPane;
    const content = monitoringPane.content;
    const toggleBtn = content.find(".btn-toggle-live");

    assert(toggleBtn.hasClass("active"), "Live monitoring button should be active initially");
    assert(toggleBtn.find(".live-pulse-dot").length > 0, "Should render green live pulse indicator dot");

    // Toggle pause
    monitoringPane.toggleLive();
    assert(!monitoringPane.isLive, "isLive property should become false");
    assert(!toggleBtn.hasClass("active"), "Toggle button should remove active class when paused");
    assert(toggleBtn.text().includes("Paused"), "Button label should update to Paused");

    // Toggle resume
    monitoringPane.toggleLive();
    assert(monitoringPane.isLive, "isLive property should become true again");
    assert(toggleBtn.hasClass("active"), "Toggle button should regain active class");
  });

  // =================================================================
  // 5. Expand & Collapse Storage Section (Buffer Fit Gauge & Tables)
  // =================================================================
  await test("monitoring tab: expands storage section and fetches memory buffer fit", async () => {
    const monitoringPane = dbScreen.view.monitoringPane;
    const content = monitoringPane.content;
    const storageSec = content.find('.monitor-section[data-section="storage"]');

    // Click disclosure header to expand
    monitoringPane.toggleSection("storage");
    assert(storageSec.hasClass("expanded"), "Storage section should receive expanded class");

    // Wait for storage stats to populate
    await waitFor(() => monitoringPane.storageData !== null, 4000);
    const dbSizeLabel = storageSec.find(".storage-db-size-label").text();
    assert(dbSizeLabel.includes("Total Database Size"), "Should display total database size");

    const gaugeLabel = storageSec.find(".storage-gauge-label").text();
    assert(gaugeLabel.includes("indexes /"), "Should display index footprint vs buffers gauge");

    // Collapse again and verify inline summary appears
    monitoringPane.toggleSection("storage");
    assert(!storageSec.hasClass("expanded"), "Storage section should collapse");
    const summaryText = storageSec.find(".section-summary-text").text();
    assert(summaryText.includes("DB:") && summaryText.includes("Indexes:"), "Summary pill should show database and index sizes");
  });

  // =================================================================
  // 6. Expand Vacuum & Table Bloat Section
  // =================================================================
  await test("monitoring tab: expands vacuum section and lists table bloat data", async () => {
    const monitoringPane = dbScreen.view.monitoringPane;
    const content = monitoringPane.content;
    const vacuumSec = content.find('.monitor-section[data-section="vacuum"]');

    monitoringPane.toggleSection("vacuum");
    assert(vacuumSec.hasClass("expanded"), "Vacuum section should receive expanded class");

    await waitFor(() => monitoringPane.vacuumData !== null, 4000);
    const summaryText = vacuumSec.find(".section-summary-text").text();
    assert(summaryText.includes("dead rows") || summaryText.includes("vacuums"), "Vacuum summary text should be populated");
  });

  // =================================================================
  // 7. Active Queries Table & Action Buttons
  // =================================================================
  await test("monitoring tab: displays running queries with cancel/kill action buttons", async () => {
    const monitoringPane = dbScreen.view.monitoringPane;
    const content = monitoringPane.content;

    // Start background sleep query on a separate connection
    const bgConn = new window.Connection();
    await new Promise((resolve, reject) => {
      bgConn.connectToServer({
        user: window.process.env.USER || "pavel",
        host: "localhost",
        port: 5432,
        database: "postbird_test",
      }, (ok, err) => {
        if (!ok) return reject(err || new Error("Failed to connect bgConn"));
        resolve();
      });
    });

    const sleepPromise = bgConn.query("SELECT pg_sleep(8);").catch(e => e);
    await new Promise(r => setTimeout(r, 100));

    // Refresh overview to pick up the active query
    await monitoringPane.fetchOverview();

    const queryRows = content.find(".active-queries-table tbody tr");
    assert(queryRows.length > 0, "Active queries table should list active sessions");

    const cancelBtns = content.find(".btn-cancel-query");
    assert(cancelBtns.length > 0, "Active query row should include Cancel button");

    const killBtns = content.find(".btn-terminate-query");
    assert(killBtns.length > 0, "Active query row should include Kill button");

    // Cancel the query cleanly
    const bgClient = (bgConn.connection as any)._clients[0];
    if (bgClient && bgClient.processID) {
      await monitoringPane.model.cancelQuery(bgClient.processID);
    }

    await sleepPromise;
    await bgConn.close();
  });
}
