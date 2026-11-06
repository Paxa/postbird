import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Client, Pool } from "../lib/sql_client";

describe("lib/sql_client Unit Tests", () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({
      host: "localhost",
      port: 5432,
      database: "postbird_test",
      user: process.env.USER || "pavel",
    });
    await client.connect();
    await client.query("DROP TABLE IF EXISTS test_sql_client_meta CASCADE;");
    await client.query(`
      CREATE TABLE test_sql_client_meta (
        id serial PRIMARY KEY,
        title text,
        score integer
      );
      INSERT INTO test_sql_client_meta (title, score) VALUES ('item 1', 100), ('item 2', 200);
    `);
  });

  afterAll(async () => {
    if (client) {
      await client.query("DROP TABLE IF EXISTS test_sql_client_meta CASCADE;").catch(() => {});
      await client.end().catch(() => {});
    }
  });

  it("extracts columns and returns row objects in standard mode", async () => {
    const res = await client.query("SELECT id, title, score FROM test_sql_client_meta ORDER BY id ASC;");
    expect(res).toBeDefined();
    expect(res.rows.length).toBe(2);
    expect(res.fields.length).toBe(3);

    const colNames = res.fields.map((f: any) => f.name);
    expect(colNames).toContain("id");
    expect(colNames).toContain("title");
    expect(colNames).toContain("score");

    expect(res.rows[0].title).toBe("item 1");
    expect(res.rows[0].score).toBe(100);
    expect(res.rows[1].title).toBe("item 2");
    expect(res.rows[1].score).toBe(200);
  });

  it("extracts columns and transforms rows to arrays in rowMode: 'array'", async () => {
    const res = await client.query({
      text: "SELECT id, title, score FROM test_sql_client_meta ORDER BY id ASC;",
      rowMode: "array",
    });

    expect(res).toBeDefined();
    expect(res.rows.length).toBe(2);
    expect(res.fields.length).toBe(3);

    const colNames = res.fields.map((f: any) => f.name);
    expect(colNames).toEqual(["id", "title", "score"]);

    // Each row must be an Array matching column order
    expect(Array.isArray(res.rows[0])).toBe(true);
    expect(res.rows[0][1]).toBe("item 1");
    expect(res.rows[0][2]).toBe(100);

    expect(Array.isArray(res.rows[1])).toBe(true);
    expect(res.rows[1][1]).toBe("item 2");
    expect(res.rows[1][2]).toBe(200);
  });

  it("handles empty result sets without throwing and preserves query structure", async () => {
    const res = await client.query("SELECT * FROM test_sql_client_meta WHERE 1 = 0;");
    expect(res).toBeDefined();
    expect(res.rows.length).toBe(0);
    expect(res.rowCount).toBe(0);
  });

  it("Pool executes queries and formats fields and rows correctly", async () => {
    const pool = new Pool({
      host: "localhost",
      port: 5432,
      database: "postbird_test",
      user: process.env.USER || "pavel",
    });

    const res = await pool.query({
      text: "SELECT title, score FROM test_sql_client_meta WHERE score = 100;",
      rowMode: "array",
    });

    expect(res.fields.map((f: any) => f.name)).toEqual(["title", "score"]);
    expect(res.rows.length).toBe(1);
    expect(res.rows[0]).toEqual(["item 1", 100]);

    await pool.end();
  });
});
