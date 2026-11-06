import { describe, it, expect, beforeEach } from "bun:test";
import { generateConnectionString, parseConnectionString } from "../lib/connection_string";
import { getPool, getPoolKey } from "../electrobun/host/db_pool";
import { SQL } from "bun";

describe("Read-Only Mode Unit & Integration Tests", () => {
  it("generateConnectionString includes options and read_only flag", () => {
    const url = generateConnectionString({
      host: "localhost",
      port: 5432,
      database: "prod_db",
      user: "postgres",
      read_only: true,
    });

    expect(url).toContain("read_only=true");
    expect(url).toContain("options=-c%20default_transaction_read_only%3Don");
  });

  it("parseConnectionString extracts read_only correctly", () => {
    const parsed1 = parseConnectionString("postgres://postgres@localhost:5432/prod_db?read_only=true");
    expect(parsed1.read_only).toBe(true);

    const parsed2 = parseConnectionString("postgres://postgres@localhost:5432/prod_db?options=-c%20default_transaction_read_only%3Don");
    expect(parsed2.read_only).toBe(true);

    const parsed3 = parseConnectionString("postgres://postgres@localhost:5432/prod_db");
    expect(parsed3.read_only).toBeUndefined();
  });

  it("getPoolKey differentiates read-only pools from read-write pools", () => {
    const rwKey = getPoolKey({ host: "localhost", port: 5432, database: "mydb", user: "pavel" });
    const roKey = getPoolKey({ host: "localhost", port: 5432, database: "mydb", user: "pavel", read_only: true });

    expect(rwKey).toContain("&read_only=false");
    expect(roKey).toContain("&read_only=true");
    expect(rwKey).not.toEqual(roKey);
  });

  it("enforces default_transaction_read_only on all pooled connections", async () => {
    const user = process.env.USER || "postgres";
    const port = Number(process.env.PG_PORT) || 5432;
    const pool = getPool({
      host: "localhost",
      port,
      database: "postbird_test",
      user,
      read_only: true,
    });

    const res = await pool.query("SHOW default_transaction_read_only;");
    const val = res.rows[0] ? (res.rows[0].default_transaction_read_only || res.rows[0][0]) : null;
    expect(val).toBe("on");

    // Mutation query must fail at the PostgreSQL database level
    let failed = false;
    try {
      await pool.query("CREATE TEMP TABLE readonly_test_fail (id int);");
    } catch (e: any) {
      failed = true;
      expect(e.message).toContain("read-only transaction");
    }
    expect(failed).toBe(true);
  });
});
