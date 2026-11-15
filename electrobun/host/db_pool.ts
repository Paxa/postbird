import { Pool } from "../../lib/sql_client";
import type { QueryResponse } from "./types";

const pools = new Map<string, Pool>();

function redactPoolKey(key: string): string {
  return key.replace(/:\/\/([^:@/]+):([^@/]+)@/g, "://$1:***@");
}

export function getPoolKey(config: any): string {
  if (typeof config === "string") {
    return config;
  }
  if (config && typeof config === "object") {
    const user = config.user || config.username || "postgres";
    const host = config.host || "localhost";
    const port = Number(config.port) || 5432;
    const database = config.database || "postgres";
    const ssl = JSON.stringify(config.ssl || false);
    const readOnly = Boolean(config.read_only || config.readOnly);
    return `${user}@${host}:${port}/${database}?ssl=${ssl}&read_only=${readOnly}`;
  }
  return "default";
}

export function getActivePoolKeys(): string[] {
  return Array.from(pools.keys());
}

export function getPool(config: any): Pool {
  const key = getPoolKey(config);
  let poolConfig = config;

  if (typeof config === "string") {
    poolConfig = { connectionString: config };
  } else if (config && typeof config === "object") {
    poolConfig = {
      host: config.host || "localhost",
      port: Number(config.port) || 5432,
      user: config.user || config.username || "postgres",
      password: config.password !== undefined ? config.password : "",
      database: config.database || "postgres",
      ssl: config.ssl || false,
      idleTimeoutMillis: 600000,
      max: config.max || 5,
      read_only: Boolean(config.read_only || config.readOnly),
    };
  } else {
    poolConfig = { host: "localhost", port: 5432, database: "postgres" };
  }

  if (!pools.has(key)) {
    console.log(`[Bun] Creating native SQL pool for: ${redactPoolKey(key)}`);
    const pool = new Pool(poolConfig);
    pool.on("error", (err: any) => {
      console.error("[Bun PG Pool Error]", err);
    });
    pools.set(key, pool);
  }

  return pools.get(key)!;
}

export async function executeQuery(sql: string, config?: any, queryOptions?: any): Promise<QueryResponse> {
  const pool = getPool(config);
  const start = performance.now();
  try {
    const queryArg = (queryOptions && queryOptions.rowMode === "array")
      ? { text: sql, rowMode: "array" }
      : sql;
    const values = Array.isArray(queryOptions?.values) ? queryOptions.values : [];
    const res = values.length > 0 ? await pool.query(queryArg, values) : await pool.query(queryArg);
    const time = Math.round((performance.now() - start) * 10) / 10;
    return {
      command: res.command || "SELECT",
      rowCount: res.rowCount ?? (res.rows ? res.rows.length : 0),
      rows: res.rows || [],
      fields: (res.fields || []).map((f: any) => ({
        name: f.name,
        tableID: f.tableID,
        columnID: f.columnID,
        dataTypeID: f.dataTypeID,
        dataTypeSize: f.dataTypeSize,
        dataTypeModifier: f.dataTypeModifier,
        format: f.format,
      })),
      time,
    };
  } catch (err: any) {
    console.error(`[Bun SQL Error]: ${sql}\n`, err.message);
    const wrapped: any = new Error(err.message || String(err));
    for (const prop of ["code", "detail", "hint", "position", "severity", "schema", "table", "column", "constraint"]) {
      if (err && err[prop] !== undefined) {
        wrapped[prop] = err[prop];
      }
    }
    throw wrapped;
  }
}

export async function disconnectPool(config: any): Promise<{ success: boolean }> {
  const key = getPoolKey(config);
  if (pools.has(key)) {
    console.log(`[Bun] Disconnecting SQL pool for: ${redactPoolKey(key)}`);
    try {
      await pools.get(key)!.end();
    } catch (e) {
      console.warn(`[Pool Disconnect] Warning on ending pool ${key}:`, e);
    }
    pools.delete(key);
  }
  return { success: true };
}

export async function closeAllPools(): Promise<void> {
  for (const [key, pool] of pools.entries()) {
    try {
      console.log(`[Graceful Shutdown] Ending pool: ${redactPoolKey(key)}`);
      await pool.end();
    } catch (e) {
      console.error(`[Pool End Error] ${key}:`, e);
    }
  }
  pools.clear();
}
