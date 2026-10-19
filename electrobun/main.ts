// @ts-nocheck
import { BrowserView, BrowserWindow, ApplicationMenu, type RPCSchema } from "electrobun/main";
import { Pool } from "pg";

type QueryResponse = {
  command: string;
  rowCount: number;
  rows: any[];
  fields: any[];
  time?: number;
};

type PostbirdRPC = {
  bun: RPCSchema<{
    requests: {
      query: {
        params: { sql: string; config?: any };
        response: QueryResponse;
      };
      disconnect: {
        params: { config?: any };
        response: { success: boolean };
      };
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};

const pools = new Map<string, Pool>();

function getPool(config: any): Pool {
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
    pool.on("error", (err) => {
      console.error("[Bun PG Pool Error]", err);
    });
    pools.set(key, pool);
  }

  return pools.get(key)!;
}

const postbirdRPC = BrowserView.defineRPC<PostbirdRPC>({
  maxRequestTime: 30000,
  handlers: {
    requests: {
      query: async ({ sql, config }) => {
        const pool = getPool(config);
        const start = performance.now();
        try {
          const res = await pool.query(sql);
          const time = Math.round((performance.now() - start) * 10) / 10;
          return {
            command: res.command || "SELECT",
            rowCount: res.rowCount ?? (res.rows ? res.rows.length : 0),
            rows: res.rows || [],
            fields: (res.fields || []).map((f) => ({
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
      },

      disconnect: async ({ config }) => {
        const key = typeof config === "string" ? config : JSON.stringify(config || {});
        if (pools.has(key)) {
          try {
            await pools.get(key)!.end();
          } catch (e) {}
          pools.delete(key);
        }
        return { success: true };
      },
    },
    messages: {},
  },
});

ApplicationMenu.setApplicationMenu([
  {
    label: "Postbird",
    submenu: [
      { role: "about" },
      { type: "divider" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "showAll" },
      { type: "divider" },
      { role: "quit" },
    ],
  },
  {
    label: "File",
    submenu: [
      { label: "New Connection", accelerator: "CmdOrCtrl+T", action: "new-connection" },
      { label: "Import .sql file", accelerator: "CmdOrCtrl+O", action: "import-sql" },
      { label: "Reconnect", action: "reconnect" },
      { type: "divider" },
      { role: "close" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "divider" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
  {
    label: "Database",
    submenu: [
      { label: "Refresh Database", accelerator: "CmdOrCtrl+Shift+R", action: "refresh-db" },
      { label: "Create Database", action: "create-db" },
      { label: "Show Connected Clients", action: "show-clients" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      { role: "bringAllToFront" },
    ],
  },
  {
    label: "Help",
    submenu: [
      { label: "Postbird on GitHub", action: "open-github" },
      { label: "PostgreSQL Documentation", action: "open-postgres-docs" },
    ],
  },
]);

ApplicationMenu.on("application-menu-clicked", (e: any) => {
  console.log("[Menu Clicked]", e);
});

const mainWindow = new BrowserWindow({
  title: "Postbird",
  url: "views://mainview/index.html",
  rpc: postbirdRPC,
  frame: {
    width: 1100,
    height: 750,
    x: 100,
    y: 100,
  },
});

console.log("Postbird Electrobun Main Process started!");
