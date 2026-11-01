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
      loadSavedConnections: {
        params: {};
        response: { connections: Record<string, any>; source: string };
      };
      saveSavedConnections: {
        params: { connections: Record<string, any> };
        response: { success: boolean };
      };
      createSshTunnel: {
        params: { options: any };
        response: { tunnelId: string; host: string; port: number; error?: string };
      };
      closeSshTunnel: {
        params: { tunnelId: string };
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
const activeTunnels = new Map<string, any>();

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

      loadSavedConnections: async () => {
        const file = path.join(getUserDataDir(), "saved_connections.json");
        try {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, "utf8");
            const data = JSON.parse(content);
            if (data && typeof data === "object") {
              return { connections: data, source: "file" };
            }
          }
        } catch (e) {
          console.error("[Saved Connections] Failed reading JSON file:", e);
        }

        // Fallback: check old Electron LevelDB
        const migrated = extractSavedConnectionsFromLevelDB();
        if (migrated && Object.keys(migrated).length > 0) {
          try {
            const dir = getUserDataDir();
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(file, JSON.stringify(migrated, null, 2), "utf8");
          } catch (e) {}
          return { connections: migrated, source: "migrated" };
        }

        return { connections: {}, source: "none" };
      },

      saveSavedConnections: async ({ connections }) => {
        try {
          const dir = getUserDataDir();
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const file = path.join(dir, "saved_connections.json");
          fs.writeFileSync(file, JSON.stringify(connections || {}, null, 2), "utf8");
          return { success: true };
        } catch (e) {
          console.error("[Saved Connections] Failed saving JSON file:", e);
          return { success: false };
        }
      },

      createSshTunnel: async ({ options }) => {
        const tunnelId = `tunnel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        try {
          const modName = ["node", "ssh", "forward"].join("-");
          const { SSHConnection } = import.meta.require(modName);
          let sshConfig: any = {};
          const configPath = path.join(os.homedir(), ".ssh", "config");
          if (fs.existsSync(configPath)) {
            try {
              const sshCfgMod = ["ssh", "config"].join("-");
              const SshConfig = import.meta.require(sshCfgMod);
              const parsed = SshConfig.parse(fs.readFileSync(configPath, "utf8"));
              parsed.forEach((host: any) => {
                if (host.param === "Host") {
                  const key = Array.isArray(host.value) ? host.value[0] : host.value;
                  sshConfig[key] = {};
                  (host.config || []).forEach((param: any) => {
                    if (param.param) sshConfig[key][param.param] = param.value;
                  });
                }
              });
            } catch (e) {}
          }

          const configFileValues = sshConfig[options.ssh_host] || {};
          const sshOptions: any = {
            endHost: configFileValues.HostName || options.ssh_host,
            username: configFileValues.User || options.ssh_user,
            password: options.ssh_pass,
            privateKey: configFileValues.IdentityFile || options.ssh_key,
            endPort: Number(configFileValues.Port || options.ssh_port || 22),
            noReadline: true,
            readyTimeout: 10000,
          };

          const conn = new SSHConnection(sshOptions);
          const freePort = await new Promise<number>((res) => {
            const s = net.createServer().listen(0, "127.0.0.1", () => {
              const p = (s.address() as any).port;
              s.close(() => res(p));
            });
          });

          await conn.forward({
            fromPort: freePort,
            toPort: Number(options.port || 5432),
            toHost: options.host || "127.0.0.1",
          });

          activeTunnels.set(tunnelId, conn);
          console.log(`[SSH Tunnel] Created tunnel ${tunnelId} on local port ${freePort} -> ${options.ssh_host}`);
          return { tunnelId, host: "127.0.0.1", port: freePort };
        } catch (err: any) {
          console.error("[SSH Tunnel Error]", err);
          return { tunnelId: "", host: "", port: 0, error: err.message || String(err) };
        }
      },

      closeSshTunnel: async ({ tunnelId }) => {
        const conn = activeTunnels.get(tunnelId);
        if (conn) {
          try {
            conn.shutdown();
          } catch (e) {}
          activeTunnels.delete(tunnelId);
          console.log(`[SSH Tunnel] Closed tunnel ${tunnelId}`);
        }
        return { success: true };
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

  for (const [id, tunnel] of activeTunnels.entries()) {
    try {
      console.log(`[Graceful Shutdown] Ending SSH tunnel: ${id}`);
      tunnel.shutdown();
    } catch (e) {}
  }
  activeTunnels.clear();
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

function parseConnectionsFromBuffer(buf: Buffer): Record<string, any> | null {
  let latestResult: Record<string, any> | null = null;

  // 1. Scan UTF-8 key
  const keyUtf8 = Buffer.from("savedConnections");
  let idx = 0;
  while ((idx = buf.indexOf(keyUtf8, idx)) !== -1) {
    const searchSlice = buf.subarray(idx, Math.min(buf.length, idx + 100));
    const braceIdx = searchSlice.indexOf(0x7b); // '{'
    if (braceIdx !== -1) {
      const start = idx + braceIdx;
      let depth = 0, inString = false, escape = false, end = -1;
      for (let i = start; i < buf.length; i++) {
        const c = buf[i];
        if (escape) { escape = false; continue; }
        if (c === 0x5c) { escape = true; continue; }
        if (c === 0x22) { inString = !inString; continue; }
        if (!inString) {
          if (c === 0x7b) depth++;
          else if (c === 0x7d) {
            depth--;
            if (depth === 0) { end = i + 1; break; }
          }
        }
      }
      if (end !== -1) {
        try {
          const parsed = JSON.parse(buf.subarray(start, end).toString("utf8"));
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            latestResult = parsed;
          }
        } catch (e) {}
      }
    }
    idx += keyUtf8.length;
  }

  // 2. Scan UTF-16LE key
  const keyUtf16 = Buffer.from("savedConnections", "utf16le");
  idx = 0;
  while ((idx = buf.indexOf(keyUtf16, idx)) !== -1) {
    const searchSlice = buf.subarray(idx, Math.min(buf.length, idx + 100));
    for (let j = 0; j < searchSlice.length - 1; j++) {
      if (searchSlice[j] === 0x7b && searchSlice[j + 1] === 0x00) {
        const start = idx + j;
        let depth = 0, inString = false, escape = false, end = -1;
        for (let i = start; i < buf.length - 1; i += 2) {
          const c0 = buf[i];
          const c1 = buf[i + 1];
          if (c1 !== 0x00) break;
          if (escape) { escape = false; continue; }
          if (c0 === 0x5c) { escape = true; continue; }
          if (c0 === 0x22) { inString = !inString; continue; }
          if (!inString) {
            if (c0 === 0x7b) depth++;
            else if (c0 === 0x7d) {
              depth--;
              if (depth === 0) { end = i + 2; break; }
            }
          }
        }
        if (end !== -1) {
          try {
            const parsed = JSON.parse(buf.subarray(start, end).toString("utf16le"));
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              latestResult = parsed;
            }
          } catch (e) {}
        }
        break;
      }
    }
    idx += keyUtf16.length;
  }

  return latestResult;
}

function extractSavedConnectionsFromLevelDB(): Record<string, any> | null {
  const possibleDirs = [
    path.join(getUserDataDir(), "Local Storage", "leveldb"),
    path.join(os.homedir(), "Library", "Application Support", "Postbird", "Local Storage", "leveldb"),
    path.join(os.homedir(), ".config", "Postbird", "Local Storage", "leveldb"),
    path.join(os.homedir(), ".config", "postbird", "Local Storage", "leveldb"),
    process.env.APPDATA ? path.join(process.env.APPDATA, "Postbird", "Local Storage", "leveldb") : null,
  ].filter(Boolean) as string[];

  for (const dir of possibleDirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      const candidateFiles = files
        .filter((f: string) => f.endsWith(".log") || f.endsWith(".ldb"))
        .map((f: string) => ({ name: f, full: path.join(dir, f), mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
        .sort((a: any, b: any) => b.mtime - a.mtime);

      for (const fileObj of candidateFiles) {
        try {
          const buf = fs.readFileSync(fileObj.full);
          const extracted = parseConnectionsFromBuffer(buf);
          if (extracted && Object.keys(extracted).length > 0) {
            console.log(`[Migration] Successfully extracted ${Object.keys(extracted).length} saved connections from ${fileObj.name}`);
            return extracted;
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
  return null;
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

if (process.env.POSTBIRD_TEST_UI === "true") {
  console.log("[Main Process] POSTBIRD_TEST_UI is active, waiting for webview to load before triggering tests...");
  let triggered = false;
  const triggerTests = async (attempts = 0) => {
    if (triggered) return;
    try {
      if (mainWindow && mainWindow.webview) {
        triggered = true;
        await mainWindow.webview.executeJavascript(
          "window.__runUITests ? window.__runUITests() : null"
        );
        console.log("[Main Process] __runUITests successfully triggered!");
        return;
      }
    } catch (err) {
      console.error("[Main Process] Error triggering UI tests:", err);
    }
    if (attempts < 30) {
      setTimeout(() => triggerTests(attempts + 1), 500);
    }
  };
  setTimeout(() => triggerTests(), 1500);
}

