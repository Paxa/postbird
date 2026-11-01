// @ts-nocheck
import type { TestHarness } from "./test_harness";

export async function runPanesAdministrationSuite(h: TestHarness, dbScreen: any) {
  console.log("\n--- [SUITE 02] Administration Panes (Users, Procedures & Info) ---");

  const { assert, waitFor, test, fillInput, clickElement, waitForDialog, closeCurrentDialog } = h;

  // =================================================================
  // 1. Users & Roles Management
  // =================================================================
  await test("users tab: renders role list and inspects user grants", async () => {
    await dbScreen.view.showTab("users");
    const usersPane = dbScreen.view.usersPane;
    await waitFor(() => usersPane && usersPane.users, 4000);

    const currentUser = window.process.env.USER || "pavel";
    assert(Object.keys(usersPane.users).length > 0, "Users tab should populate with roles");

    // Create a temporary test role directly in database
    await dbScreen.connection.query("DROP ROLE IF EXISTS e2e_test_role;");
    await dbScreen.connection.query("CREATE ROLE e2e_test_role WITH LOGIN PASSWORD 'secret123';");

    // Reload users tab and verify role is present
    await dbScreen.usersTabActivate();
    await waitFor(() => usersPane.users && usersPane.users["e2e_test_role"], 3000);
    assert(usersPane.users["e2e_test_role"], "e2e_test_role should be rendered in users tab");

    // Inspect grants dialog
    usersPane.getGrants("e2e_test_role");
    const grantsDialog = await waitForDialog("user-grants", 3000);
    assert(grantsDialog, "User grants dialog should open");
    assert(grantsDialog.querySelector("table"), "Grants dialog should render a table");

    await closeCurrentDialog();

    // Clean up role
    await dbScreen.connection.query("DROP ROLE IF EXISTS e2e_test_role;");
    await dbScreen.usersTabActivate();
    assert(!usersPane.users["e2e_test_role"], "e2e_test_role should be removed from users map");
  });

  // =================================================================
  // 2. Stored Procedures & Functions
  // =================================================================
  await test("procedures tab: lists functions, inspects definition, and views languages", async () => {
    // Create test function
    await dbScreen.connection.query("DROP FUNCTION IF EXISTS e2e_calc_sum(integer, integer);");
    await dbScreen.connection.query(`
      CREATE OR REPLACE FUNCTION e2e_calc_sum(a integer, b integer)
      RETURNS integer AS $$
      BEGIN
        RETURN a + b;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await dbScreen.view.showTab("procedures");
    const procsPane = dbScreen.view.proceduresPane;

    await waitFor(() => {
      const rows = procsPane.content.find("table tbody tr");
      return rows.text().includes("e2e_calc_sum");
    }, 4000);

    const procRow = procsPane.content.find("table tbody tr").filter((_, el) => {
      return el.textContent.includes("e2e_calc_sum");
    });
    assert(procRow.length > 0, "e2e_calc_sum function must be listed in procedures table");
    assert(procRow.text().includes("plpgsql"), "Function language should display plpgsql");

    // Open procedure source definition dialog
    const sourceLink = procRow.find("a[exec*='procDefinition']");
    assert(sourceLink.length > 0, "Source link should exist for procedure");
    const poidMatch = sourceLink.attr("exec").match(/'(\d+)'/);
    assert(poidMatch, "Procedure OID should be extracted from exec attribute");
    await procsPane.procDefinition(poidMatch[1]);

    const defDialog = await waitForDialog("source-procedure-dialog", 4000);
    assert(defDialog, "Procedure definition dialog should open");
    assert(defDialog.textContent.includes("RETURN a + b"), "Procedure definition dialog must contain source SQL");

    await closeCurrentDialog();

    // Test List Languages dialog
    procsPane.listLanguages();
    const langDialog = await waitForDialog("list-languages", 4000);
    assert(langDialog, "List Languages dialog should open");
    assert(langDialog.textContent.includes("plpgsql"), "List languages must include plpgsql");

    await closeCurrentDialog();

    // Clean up function
    await dbScreen.connection.query("DROP FUNCTION IF EXISTS e2e_calc_sum(integer, integer);");
  });

  // =================================================================
  // 3. Table Info & Disk Usage Summary
  // =================================================================
  await test("info tab: renders table disk usage, row count estimate, and source SQL", async () => {
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_info_tbl CASCADE;");
    await dbScreen.connection.query(`
      CREATE TABLE test_info_tbl (
        id serial PRIMARY KEY,
        name text NOT NULL,
        metadata jsonb
      );
    `);
    await dbScreen.connection.query(`
      INSERT INTO test_info_tbl (name, metadata) VALUES
      ('Alpha', '{"active": true}'::jsonb),
      ('Beta', '{"active": false}'::jsonb),
      ('Gamma', '{"count": 42}'::jsonb);
    `);

    // Select the table and open 'info' tab
    await dbScreen.tableSelected("public", "test_info_tbl", "info");
    const infoPane = dbScreen.view.infoPane;

    await waitFor(() => infoPane && infoPane.relType && infoPane.diskUsage, 4000);

    assert(infoPane.relType?.toLowerCase() === "base table" || infoPane.relType?.toLowerCase() === "table", "relType should indicate base table");
    assert(typeof infoPane.recordsCount === "number" || typeof infoPane.recordsCount === "string", "recordsCount should be a number");
    assert(infoPane.diskUsage && (typeof infoPane.diskUsage.total === "number" || typeof infoPane.diskUsage.total === "string"), "diskUsage.total should be numeric");
    assert(Number(infoPane.diskUsage.total) > 0, "diskUsage.total should be greater than 0");

    // Verify source code rendering
    await waitFor(() => infoPane.source && infoPane.source.includes("test_info_tbl"), 4000);
    assert(infoPane.source.includes("test_info_tbl"), "infoPane source should contain CREATE TABLE definition");

    // Clean up
    await dbScreen.connection.query("DROP TABLE IF EXISTS test_info_tbl CASCADE;");
  });
}
