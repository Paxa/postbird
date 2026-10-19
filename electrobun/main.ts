// @ts-nocheck
import { BrowserView, BrowserWindow, ApplicationMenu, type RPCSchema } from "electrobun/main";
import { Pool } from "pg";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

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
        params: { sql: string; config?: any; queryOptions?: any };
        response: QueryResponse;
      };
      disconnect: {
        params: { config?: any };
        response: { success: boolean };
      };
      spawnProcess: {
        params: { bin: string; args: string[]; options?: any };
        response: { code: number; stdout: string; stderr: string };
      };
      finishTests: {
        params: { total: number; failed: number };
        response: { exitCode: number };
      };
      quitApp: {
        params: {};
        response: { success: boolean };
      };
      getWindowState: {
        params: {};
        response: { width: number; height: number; x: number; y: number };
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
      query: async ({ sql, config, queryOptions }) => {
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

      spawnProcess: async ({ bin, args, options }) => {
        const { spawn } = await import("child_process");
        const path = await import("path");
        const fs = await import("fs");

        let resolvedBin = bin;
        if (!fs.existsSync(resolvedBin)) {
          const appVendorBin = path.resolve(__dirname, "..", bin);
          const platformVendorBin = path.resolve(__dirname, "..", "vendor", process.platform, path.basename(bin));
          const cwdVendorBin = path.resolve(process.cwd(), bin);
          const cwdPlatformVendorBin = path.resolve(process.cwd(), "vendor", process.platform, path.basename(bin));
          const pgAppBin = `/Applications/Postgres.app/Contents/Versions/latest/bin/${path.basename(bin)}`;

          if (fs.existsSync(appVendorBin)) {
            resolvedBin = appVendorBin;
          } else if (fs.existsSync(platformVendorBin)) {
            resolvedBin = platformVendorBin;
          } else if (fs.existsSync(cwdVendorBin)) {
            resolvedBin = cwdVendorBin;
          } else if (fs.existsSync(cwdPlatformVendorBin)) {
            resolvedBin = cwdPlatformVendorBin;
          } else if (fs.existsSync(pgAppBin)) {
            resolvedBin = pgAppBin;
          } else {
            resolvedBin = path.basename(bin);
          }
        }

        if (process.platform === "darwin" && fs.existsSync(resolvedBin)) {
          try {
            const { spawnSync } = await import("child_process");
            spawnSync("xattr", ["-d", "com.apple.quarantine", resolvedBin]);
          } catch (e) {}
        }

        return new Promise((resolve) => {
          let stdout = "";
          let stderr = "";
          try {
            const proc = spawn(resolvedBin, args || [], {
              cwd: options?.cwd || process.cwd(),
              env: { ...process.env, ...(options?.env || {}) },
            });
            proc.stdout?.on("data", (d: any) => {
              stdout += d.toString();
            });
            proc.stderr?.on("data", (d: any) => {
              stderr += d.toString();
            });
            proc.on("close", (code: any) => {
              resolve({ code: code ?? 0, stdout, stderr });
            });
            proc.on("error", (err: any) => {
              resolve({ code: 1, stdout, stderr: err.message || String(err) });
            });
          } catch (err: any) {
            resolve({ code: 1, stdout, stderr: err.message || String(err) });
          }
        });
      },

      finishTests: async ({ total, failed }) => {
        console.log(`[Host Test Runner] UI tests complete: ${total - failed}/${total} passed (${failed} failed)`);
        setTimeout(() => {
          process.exit(failed > 0 ? 1 : 0);
        }, 150);
        return { exitCode: failed > 0 ? 1 : 0 };
      },

      quitApp: async () => {
        console.log("[Graceful Shutdown] Received quitApp RPC request, ending pools and exiting...");
        saveWindowState(mainWindow);
        await closeAllPools();
        setTimeout(() => {
          process.exit(0);
        }, 80);
        return { success: true };
      },

      getWindowState: async () => {
        return loadWindowState();
      },
    },
    messages: {},
  },
});

async function closeAllPools() {
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

function getUserDataDir(): string {
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Postbird");
  } else if (process.platform === "win32") {
    return process.env.APPDATA
      ? path.join(process.env.APPDATA, "Postbird")
      : path.join(os.homedir(), "AppData", "Roaming", "Postbird");
  } else {
    return process.env.XDG_CONFIG_HOME
      ? path.join(process.env.XDG_CONFIG_HOME, "postbird")
      : path.join(os.homedir(), ".config", "postbird");
  }
}

const windowStateFile = path.join(getUserDataDir(), "window-state.json");

function loadWindowState(): { width: number; height: number; x: number; y: number } {
  const defaultState = { width: 1100, height: 750, x: 100, y: 100 };
  try {
    if (fs.existsSync(windowStateFile)) {
      const data = JSON.parse(fs.readFileSync(windowStateFile, "utf8"));
      if (typeof data.width === "number" && typeof data.height === "number") {
        console.log("[Window State] Loaded previous window state:", data);
        return {
          width: Math.max(400, data.width),
          height: Math.max(300, data.height),
          x: typeof data.x === "number" ? Math.max(0, data.x) : 100,
          y: typeof data.y === "number" ? Math.max(0, data.y) : 100,
        };
      }
    }
  } catch (err) {
    console.error("[Window State] Failed to load window state:", err);
  }
  return defaultState;
}

function saveWindowState(win: any) {
  try {
    if (!win) return;
    const frame = typeof win.getFrame === "function" ? win.getFrame() : win.frame;
    if (frame && frame.width && frame.height) {
      const dir = getUserDataDir();
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        width: Math.round(frame.width),
        height: Math.round(frame.height),
        x: Math.round(frame.x),
        y: Math.round(frame.y),
        isMaximized: typeof win.isMaximized === "function" ? win.isMaximized() : false,
        isFullScreen: typeof win.isFullScreen === "function" ? win.isFullScreen() : false,
      };
      fs.writeFileSync(windowStateFile, JSON.stringify(data, null, 2), "utf8");
      console.log("[Window State] Saved window state:", data);
    }
  } catch (err) {
    console.error("[Window State] Failed to save window state:", err);
  }
}

function debounce(fn: (...args: any[]) => void, wait = 500) {
  let timer: any = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };
}

async function handleGracefulQuit() {
  console.log("[Graceful Shutdown] Initiating graceful shutdown via Cmd+Q / Menu...");
  saveWindowState(mainWindow);
  try {
    if (mainWindow && mainWindow.webview) {
      await mainWindow.webview.executeJavascript(
        "window.__postbirdGracefulQuit ? window.__postbirdGracefulQuit() : null"
      );
    }
  } catch (err) {
    console.error("[Graceful Shutdown] Failed to trigger webview quit:", err);
  }

  await closeAllPools();
  setTimeout(() => {
    process.exit(0);
  }, 150);
}

process.on("SIGINT", () => handleGracefulQuit());
process.on("SIGTERM", () => handleGracefulQuit());

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
      { label: "Quit Postbird", accelerator: "CmdOrCtrl+Q", action: "quit-app" },
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

ApplicationMenu.on("application-menu-clicked", async (e: any) => {
  console.log("[Menu Clicked]", e);
  if (e?.action === "quit-app") {
    await handleGracefulQuit();
  }
});

const savedFrame = loadWindowState();
const mainWindow = new BrowserWindow({
  title: "Postbird",
  url: "views://mainview/index.html",
  rpc: postbirdRPC,
  frame: savedFrame,
});

const debouncedSaveState = debounce(() => saveWindowState(mainWindow), 500);
if (typeof mainWindow.on === "function") {
  mainWindow.on("resize", debouncedSaveState);
  mainWindow.on("move", debouncedSaveState);
  mainWindow.on("close", () => saveWindowState(mainWindow));
}
process.on("exit", () => saveWindowState(mainWindow));

console.log("Postbird Electrobun Main Process started!");

