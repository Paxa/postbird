import pg from "pg";
import type { QueryResponse } from "./types";

const Pool = (pg as any).Pool || require("pg").Pool;
const pools = new Map<string, any>();

export function getPool(config: any): any {
  let key: string;
  let poolConfig = config;

  if (typeof config === "string") {
    key = config;
    poolConfig = { connectionString: config };
  } else if (config) {
    key = `${config.user}@${config.host}:${config.port}/${config.database}`;
    poolConfig = {
      host: config.host || "localhost",
      port: Number(config.port) || 5432,
      user: config.user || "postgres",
      password: config.password || "",
      database: config.database || "postgres",
      ssl: config.ssl || false,
      idleTimeoutMillis: 600000,
      max: config.max || 5,
    };
  } else {
    key = "default";
    poolConfig = { host: "localhost", port: 5432, database: "postgres" };
  }

  if (!pools.has(key)) {
    console.log(`[Bun] Creating PostgreSQL pool for: ${key}`);
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
    const res = await pool.query(queryArg);
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
    throw new Error(err.message || String(err));
  }
}

export async function disconnectPool(config: any): Promise<{ success: boolean }> {
  const key = typeof config === "string" ? config : JSON.stringify(config || {});
  if (pools.has(key)) {
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
      console.log(`[Graceful Shutdown] Ending pool: ${key}`);
      await pool.end();
    } catch (e) {
      console.error(`[Pool End Error] ${key}:`, e);
    }
  }
  pools.clear();
}
