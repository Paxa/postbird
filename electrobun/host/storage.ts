import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import type { WindowFrameState } from "./types";

export function getUserDataDir(): string {
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

export function parseConnectionsFromBuffer(buf: Buffer): Record<string, any> | null {
  let latestResult: Record<string, any> | null = null;

  // 1. Scan UTF-8 key
  const keyUtf8 = Buffer.from("savedConnections");
  let idx = 0;
  while ((idx = buf.indexOf(keyUtf8, idx)) !== -1) {
    const searchSlice = buf.subarray(idx, Math.min(buf.length, idx + 100));
    const braceIdx = searchSlice.indexOf(0x7b); // '{'
    if (braceIdx !== -1) {
      const start = idx + braceIdx;
      let depth = 0;
      let inString = false;
      let escape = false;
      let end = -1;
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
        } catch (e) {
          // ignore corrupted JSON chunks in LevelDB logs
        }
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
        let depth = 0;
        let inString = false;
        let escape = false;
        let end = -1;
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
          } catch (e) {
            // ignore corrupted UTF-16 chunks
          }
        }
        break;
      }
    }
    idx += keyUtf16.length;
  }

  return latestResult;
}

export function extractSavedConnectionsFromLevelDB(): Record<string, any> | null {
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
        } catch (e) {
          // continue checking next file
        }
      }
    } catch (e) {
      // ignore inaccessible directory
    }
  }
  return null;
}

export function loadSavedConnections(): { connections: Record<string, any>; source: string } {
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
    } catch (e) {
      console.warn("[Saved Connections] Could not persist migrated connections to disk:", e);
    }
    return { connections: migrated, source: "migrated" };
  }

  return { connections: {}, source: "none" };
}

export function saveSavedConnections(connections: Record<string, any>): { success: boolean } {
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
}

const windowStateFile = path.join(getUserDataDir(), "window-state.json");

export function loadWindowState(): WindowFrameState {
  const defaultState: WindowFrameState = { width: 1100, height: 750, x: 100, y: 100 };
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

export function saveWindowState(win: any): void {
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

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 500): (...args: Parameters<T>) => void {
  let timer: any = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };
}
