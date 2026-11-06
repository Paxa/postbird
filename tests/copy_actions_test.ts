import { describe, it, expect, beforeEach } from "bun:test";
require("./test_helper");
require("../app/views/panes/base");
require("../app/views/dialogs/base");
const formatUtil = require("../lib/format_util");

describe("1-Click Copy Actions in Table Rows & Query Results", () => {
  let capturedClipboardText = "";

  beforeEach(() => {
    capturedClipboardText = "";
    (global as any).navigator = (global as any).navigator || {};
    (global as any).navigator.clipboard = {
      writeText: async (text: string) => {
        capturedClipboardText = text;
        return Promise.resolve();
      }
    };
  });

  describe("Format utilities", () => {
    it("handles mixed types, nulls, and formats accurately", () => {
      const fields = [
        { name: "id" },
        { name: "is_active" },
        { name: "tags" },
        { name: "created_at" }
      ];
      const now = new Date("2026-11-06T00:00:00.000Z");
      const rows = [
        { id: 1, is_active: true, tags: ["admin"], created_at: now },
        { id: 2, is_active: false, tags: null, created_at: null }
      ];

      const jsonStr = formatUtil.rowsToJson(fields, rows);
      const parsed = JSON.parse(jsonStr);
      expect(parsed.length).toBe(2);
      expect(parsed[0].id).toBe(1);
      expect(parsed[0].is_active).toBe(true);

      const md = formatUtil.rowsToMarkdown(fields, rows);
      expect(md).toContain("| id | is_active | tags | created_at |");
      expect(md).toContain("| 1 | true | [\"admin\"] | 2026-11-06T00:00:00.000Z |");
      expect(md).toContain("| 2 | false | NULL | NULL |");
    });
  });

  describe("Content Pane copy methods", () => {
    it("copies a row as JSON and Markdown", () => {
      const Content = require("../app/views/panes/content");
      const pane = Object.create(Content.prototype);

      pane.currentData = {
        fields: [{ name: "id" }, { name: "name" }, { name: "ctid" }],
        rows: [
          { id: 42, name: "Sample Item", ctid: "(0,1)" },
          { id: 43, name: "Another Item", ctid: "(0,2)" }
        ]
      };

      const mockTr = document.createElement("tr");
      mockTr.setAttribute("data-ctid", "(0,1)");

      pane.copyRowAsJson(mockTr);
      expect(capturedClipboardText).toContain('"id": 42');
      expect(capturedClipboardText).toContain('"name": "Sample Item"');
      expect(capturedClipboardText).not.toContain('"ctid"');

      pane.copyRowAsMarkdown(mockTr);
      expect(capturedClipboardText).toContain("| id | name |");
      expect(capturedClipboardText).toContain("| 42 | Sample Item |");
    });

    it("copies a column as SQL IN clause", () => {
      const Content = require("../app/views/panes/content");
      const pane = Object.create(Content.prototype);

      pane.currentData = {
        fields: [{ name: "id" }, { name: "sku" }, { name: "ctid" }],
        rows: [
          { id: 1, sku: "PROD-A", ctid: "(0,1)" },
          { id: 2, sku: "PROD-B", ctid: "(0,2)" },
          { id: 3, sku: "PROD-A", ctid: "(0,3)" } // duplicate to test deduplication
        ]
      };

      const mockTdSku = document.createElement("td");
      // mock $u(cell).prevAll('td, th').length to return 1 (sku column)
      const mockTr = document.createElement("tr");
      const td0 = document.createElement("td");
      mockTr.appendChild(td0);
      mockTr.appendChild(mockTdSku);

      pane.copyColumnAsInClause(mockTdSku);
      expect(capturedClipboardText).toBe("('PROD-A', 'PROD-B')");
    });

    it("copies all loaded rows as JSON and Markdown", () => {
      const Content = require("../app/views/panes/content");
      const pane = Object.create(Content.prototype);

      pane.currentData = {
        fields: [{ name: "id" }, { name: "role" }],
        rows: [
          { id: 1, role: "admin" },
          { id: 2, role: "user" }
        ]
      };

      pane.copyAllLoadedAsJson();
      const parsedJson = JSON.parse(capturedClipboardText);
      expect(parsedJson.length).toBe(2);
      expect(parsedJson[0].role).toBe("admin");

      pane.copyAllLoadedAsMarkdown();
      expect(capturedClipboardText).toContain("| id | role |");
      expect(capturedClipboardText).toContain("| 1 | admin |");
      expect(capturedClipboardText).toContain("| 2 | user |");
    });
  });

  describe("Query Pane copy methods", () => {
    it("copies a query result row as JSON and Markdown", () => {
      const Query = require("../app/views/panes/query");
      const pane = Object.create(Query.prototype);

      pane.lastResult = {
        fields: [{ name: "order_id" }, { name: "total" }],
        rows: [
          [1001, 49.99],
          [1002, 120.00]
        ]
      };

      const tbody = document.createElement("tbody");
      const tr0 = document.createElement("tr");
      const tr1 = document.createElement("tr");
      tbody.appendChild(tr0);
      tbody.appendChild(tr1);

      pane.copyResultRowAsJson(tr1);
      const row1Obj = JSON.parse(capturedClipboardText);
      expect(row1Obj).toEqual({ order_id: 1002, total: 120.00 });

      pane.copyResultRowAsMarkdown(tr0);
      expect(capturedClipboardText).toContain("| order_id | total |");
      expect(capturedClipboardText).toContain("| 1001 | 49.99 |");
    });

    it("copies query column as IN clause across rows", () => {
      const Query = require("../app/views/panes/query");
      const pane = Object.create(Query.prototype);

      pane.lastResult = {
        fields: [{ name: "user_id" }, { name: "code" }],
        rows: [
          [10, "ALPHA"],
          [20, "BETA"],
          [30, "GAMMA"]
        ]
      };

      const tr = document.createElement("tr");
      const thUser = document.createElement("th");
      tr.appendChild(thUser);

      pane.copyResultColumnAsInClause(thUser);
      expect(capturedClipboardText).toBe("(10, 20, 30)");
    });

    it("copies all query results as JSON, Markdown, and CSV", () => {
      const Query = require("../app/views/panes/query");
      const pane = Object.create(Query.prototype);

      pane.lastResult = {
        fields: [{ name: "id" }, { name: "status" }],
        rows: [
          [1, "pending"],
          [2, "completed"]
        ]
      };

      pane.copyAllResultsAsJson();
      const jsonArr = JSON.parse(capturedClipboardText);
      expect(jsonArr.length).toBe(2);
      expect(jsonArr[0]).toEqual({ id: 1, status: "pending" });

      pane.copyAllResultsAsMarkdown();
      expect(capturedClipboardText).toContain("| id | status |");
      expect(capturedClipboardText).toContain("| 1 | pending |");
      expect(capturedClipboardText).toContain("| 2 | completed |");

      pane.copyAllResultsAsCsv();
      expect(capturedClipboardText).toContain("id,status");
      expect(capturedClipboardText).toContain("1,pending");
      expect(capturedClipboardText).toContain("2,completed");
    });

    it("toggles both saveButton and copyButton when results appear or clear", () => {
      const Query = require("../app/views/panes/query");
      const pane = Object.create(Query.prototype);

      let saveShown = false;
      let copyShown = false;

      pane.saveButton = {
        show: () => { saveShown = true; },
        hide: () => { saveShown = false; }
      };
      pane.copyButton = {
        show: () => { copyShown = true; },
        hide: () => { copyShown = false; }
      };

      // Mock empty results
      pane.content = {
        find: (sel: string) => {
          if (sel === ".result table tr") return { length: 0 };
          return { length: 0 };
        }
      };
      pane.toggleSaveButton();
      expect(saveShown).toBe(false);
      expect(copyShown).toBe(false);

      // Mock results present
      pane.content = {
        find: (sel: string) => {
          if (sel === ".result table tr") return { length: 5 };
          return { length: 5 };
        }
      };
      pane.toggleSaveButton();
      expect(saveShown).toBe(true);
      expect(copyShown).toBe(true);
    });
  });
});
