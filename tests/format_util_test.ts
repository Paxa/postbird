import { describe, it, expect } from "bun:test";
import {
  cleanFieldNames,
  rowToObject,
  rowToJson,
  rowsToJson,
  formatCellMarkdown,
  rowsToMarkdown,
  columnToInClause
} from "../lib/format_util";

describe("Format Utilities Unit Tests", () => {
  const fields = [
    { name: "id", data_type: "integer" },
    { name: "username", data_type: "character varying" },
    { name: "email", data_type: "character varying" },
    { name: "ctid", data_type: "tid" }
  ];

  it("filters out pseudocolumns like ctid", () => {
    const cleaned = cleanFieldNames(fields);
    expect(cleaned).toEqual(["id", "username", "email"]);
  });

  it("converts row array and row object to JSON object", () => {
    const arrayRow = [101, "alice", "alice@example.com", "(0,1)"];
    const objFromArray = rowToObject(fields, arrayRow);
    expect(objFromArray).toEqual({
      id: 101,
      username: "alice",
      email: "alice@example.com"
    });

    const recordRow = { id: 102, username: "bob", email: "bob@example.com", ctid: "(0,2)" };
    const objFromRecord = rowToObject(fields, recordRow);
    expect(objFromRecord).toEqual({
      id: 102,
      username: "bob",
      email: "bob@example.com"
    });
  });

  it("serializes single row to formatted JSON string", () => {
    const row = { id: 1, username: "admin", email: "admin@postbird.org" };
    const jsonStr = rowToJson(fields, row);
    expect(JSON.parse(jsonStr)).toEqual(row);
    expect(jsonStr).toContain('  "username": "admin"');
  });

  it("serializes multiple rows to JSON array", () => {
    const rows = [
      [1, "alice", "alice@test.com"],
      [2, "bob", "bob@test.com"]
    ];
    const jsonStr = rowsToJson(["id", "username", "email"], rows);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.length).toBe(2);
    expect(parsed[0].username).toBe("alice");
    expect(parsed[1].username).toBe("bob");
  });

  it("formats Markdown table with headers and escaped pipes", () => {
    const rows = [
      { id: 1, username: "alice", email: "alice|special@test.com" },
      { id: 2, username: "bob\nline2", email: "bob@test.com" }
    ];
    const md = rowsToMarkdown(fields, rows);
    const lines = md.split("\n");

    expect(lines[0]).toBe("| id | username | email |");
    expect(lines[1]).toBe("| --- | --- | --- |");
    expect(lines[2]).toBe("| 1 | alice | alice\\|special@test.com |");
    expect(lines[3]).toContain("bob line2");
  });

  it("formats SQL IN clause for numbers, strings, and deduplicates", () => {
    const ids = [1, 2, 3, 2, 1, null, undefined];
    const inIds = columnToInClause(ids);
    expect(inIds).toBe("(1, 2, 3)");

    const uuids = [
      "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    ];
    const inUuids = columnToInClause(uuids);
    expect(inUuids).toBe("('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22')");

    const stringsWithQuotes = ["O'Connor", "D'Artagnan"];
    const inQuotes = columnToInClause(stringsWithQuotes);
    expect(inQuotes).toBe("('O''Connor', 'D''Artagnan')");

    const withoutParens = columnToInClause([10, 20], { withParentheses: false });
    expect(withoutParens).toBe("10, 20");
  });
});
