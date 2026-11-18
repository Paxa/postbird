import { ApplicationMenu, BrowserView, BrowserWindow, ContextMenu, Updater, Utils } from "electrobun/main";
import fs from "fs";
import path from "path";
import os from "os";
import type { PostbirdRPC } from "./host/types";
import { executeQuery, disconnectPool, closeAllPools } from "./host/db_pool";
import { createSshTunnel, closeSshTunnel, closeAllTunnels } from "./host/ssh_tunnel";
import { writeDevErrorLog } from "./host/dev_logger";
import { writeAiLog } from "./host/ai_logger";
import {
  loadSavedConnections,
  saveSavedConnections,
  loadWindowState,
  saveWindowState,
  debounce,
} from "./host/storage";
import { spawnProcess, killProcess } from "./host/process_runner";
import { setupApplicationMenu } from "./host/menu";
import { checkForUpdates, installUpdate, isStoreManaged } from "./host/updater";

const postbirdRPC = BrowserView.defineRPC<PostbirdRPC>({
  maxRequestTime: 300000, // 5 minutes (prevents timeout on long AI prompts, queries, and dump/restore)
  handlers: {
    requests: {
      query: async ({ sql, config, queryOptions }) => {
        return executeQuery(sql, config, queryOptions);
      },

      disconnect: async ({ config }) => {
        return disconnectPool(config);
      },

      spawnProcess: async ({ bin, args, options, streamId }) => {
        const ALLOWED_RPC_BINS = new Set([
          "pg_dump",
          "pg_restore",
          "psql",
          "claude",
          "agy",
          "fm",
          "foundry",
          "ollama",
        ]);
        const baseBin = path.basename(bin || "");
        if (!ALLOWED_RPC_BINS.has(baseBin)) {
          console.warn(`[Host Security] Blocked disallowed RPC spawnProcess binary: ${bin}`);
          return { code: 1, stdout: "", stderr: `Disallowed binary: ${baseBin}` };
        }
        const pushChunk = streamId
          ? (stream: "stdout" | "stderr", chunk: string) => {
              try {
                if (mainWindow && mainWindow.webview) {
                  mainWindow.webview.executeJavascript(
                    `window.__postbirdProcessChunk && window.__postbirdProcessChunk(${JSON.stringify(streamId)}, ${JSON.stringify(stream)}, ${JSON.stringify(chunk)})`
                  );
                }
              } catch {}
            }
          : undefined;
        return spawnProcess({
          bin,
          args,
          options,
          streamId,
          ...(pushChunk
            ? {
                onStdoutChunk: (chunk) => pushChunk("stdout", chunk),
                onStderrChunk: (chunk) => pushChunk("stderr", chunk),
              }
            : {}),
        });
      },

      killProcess: async ({ streamId }) => {
        return { success: killProcess(streamId) };
      },

      discoverAiProviders: async ({ customEndpoints }) => {
        const { discoverProviders } = await import("../lib/local_ai/discovery");
        return await discoverProviders(customEndpoints || []);
      },

      verifyAiProvider: async (params) => {
        const { verifyProvider } = await import("../lib/local_ai/discovery");
        return await verifyProvider(params.providerId, params);
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
        await closeAllTunnels();
        setTimeout(() => {
          process.exit(0);
        }, 80);
        return { success: true };
      },

      getWindowState: async () => {
        return loadWindowState();
      },

      loadSavedConnections: async () => {
        return loadSavedConnections();
      },

      saveSavedConnections: async ({ connections }) => {
        return saveSavedConnections(connections);
      },

      createSshTunnel: async ({ options }) => {
        return createSshTunnel(options);
      },

      closeSshTunnel: async ({ tunnelId }) => {
        return closeSshTunnel(tunnelId);
      },

      logDevError: async (params) => {
        writeDevErrorLog(params);
        return { success: true };
      },

      logAi: async (params) => {
        writeAiLog(params);
        return { success: true };
      },

      openFileDialog: async (params) => {
        try {
          if (process.platform === "darwin") {
            const types = (params.allowedFileTypes && params.allowedFileTypes !== "*")
              ? params.allowedFileTypes.split(",").map(t => `"${t.trim().replace(/^\./, "")}"`).join(", ")
              : "";
            const ofType = types ? ` of type {${types}}` : "";
            const promptTitle = (params.title || "Open SQL File").replace(/"/g, '\\"');
            const script = `POSIX path of (choose file with prompt "${promptTitle}"${ofType})`;
            const res = await spawnProcess({ bin: "osascript", args: ["-e", script] });
            const chosenPath = (res.stdout || "").trim();
            if (res.code === 0 && chosenPath) {
              return { canceled: false, filePaths: [chosenPath] };
            }
            if (res.code !== 0 && !res.stderr?.includes("error -128")) {
              const paths = await Utils.openFileDialog({
                startingFolder: params.startingFolder || "~/",
                allowedFileTypes: params.allowedFileTypes || "*",
                canChooseFiles: params.canChooseFiles ?? true,
                canChooseDirectory: params.canChooseDirectory ?? false,
                allowsMultipleSelection: params.allowsMultipleSelection ?? false,
              });
              return {
                canceled: !paths || paths.length === 0,
                filePaths: paths || [],
              };
            }
            return { canceled: true, filePaths: [] };
          } else {
            const paths = await Utils.openFileDialog({
              startingFolder: params.startingFolder || "~/",
              allowedFileTypes: params.allowedFileTypes || "*",
              canChooseFiles: params.canChooseFiles ?? true,
              canChooseDirectory: params.canChooseDirectory ?? false,
              allowsMultipleSelection: params.allowsMultipleSelection ?? false,
            });
            return {
              canceled: !paths || paths.length === 0,
              filePaths: paths || [],
            };
          }
        } catch (err) {
          console.error("[Host openFileDialog Error]", err);
          return { canceled: true, filePaths: [] };
        }
      },

      saveFileDialog: async (params) => {
        const defaultName = path.basename(params.defaultPath || "export.sql");
        const promptTitle = (params.message || params.title || "Save File").replace(/"/g, '\\"');
        try {
          if (process.platform === "darwin") {
            const safeDefaultName = defaultName.replace(/"/g, '\\"');
            const script = `POSIX path of (choose file name with prompt "${promptTitle}" default name "${safeDefaultName}")`;
            const res = await spawnProcess({ bin: "osascript", args: ["-e", script] });
            const chosenPath = (res.stdout || "").trim();
            if (res.code === 0 && chosenPath) {
              return { canceled: false, filePath: chosenPath };
            }
            return { canceled: true, filePath: null };
          } else {
            const dirs = await Utils.openFileDialog({
              startingFolder: "~/",
              allowedFileTypes: "*",
              canChooseFiles: false,
              canChooseDirectory: true,
              allowsMultipleSelection: false,
            });
            if (dirs && dirs.length > 0) {
              return { canceled: false, filePath: path.join(dirs[0], defaultName) };
            }
            return { canceled: true, filePath: null };
          }
        } catch (err) {
          console.error("[Host saveFileDialog Error]", err);
          return { canceled: true, filePath: null };
        }
      },

      writeFile: async ({ filePath, content }) => {
        try {
          const resolved = filePath.startsWith("~/")
            ? path.join(os.homedir(), filePath.slice(2))
            : filePath;
          fs.mkdirSync(path.dirname(resolved), { recursive: true });
          fs.writeFileSync(resolved, content, "utf8");
          return { success: true };
        } catch (err: any) {
          console.error("[Host writeFile Error]", err);
          return { success: false, error: err?.message || String(err) };
        }
      },

      openExternal: async ({ url }) => {
        try {
          if (url && /^(https?:\/\/|mailto:)/i.test(url)) {
            Utils.openExternal(url);
            return { success: true };
          }
          return { success: false };
        } catch (err) {
          console.error("[Host openExternal Error]", err);
          return { success: false };
        }
      },

      getSystemInfo: async () => {
        const platform = os.platform();
        const arch = os.arch();
        const release = os.release();
        let osVersion = release;
        if (platform === "darwin") {
          try {
            const plist = fs.readFileSync("/System/Library/CoreServices/SystemVersion.plist", "utf8");
            const match = plist.match(/<key>ProductVersion<\/key>\s*<string>([^<]+)<\/string>/);
            if (match?.[1]) osVersion = match[1];
          } catch {}
        }
        return { platform, arch, release, osVersion };
      },

      showContextMenu: async ({ items }) => {
        // Linux showContextMenu is unsupported in Electrobun, and UI tests need DOM-queryable menus
        if (process.platform === "linux" || process.env.POSTBIRD_TEST_UI === "true") {
          return { success: false, fallback: true };
        }
        try {
          if (ContextMenu && typeof ContextMenu.showContextMenu === "function") {
            ContextMenu.showContextMenu(items as any);
            return { success: true };
          }
          return { success: false, fallback: true };
        } catch (err) {
          console.error("[Host showContextMenu Error]", err);
          return { success: false, fallback: true };
        }
      },

      checkForUpdates: async () => {
        return checkForUpdates({ updater: Updater });
      },

      installUpdate: async () => {
        return installUpdate({
          updater: Updater,
          onBeforeApply: async () => {
            saveWindowState(mainWindow);
            await closeAllPools();
            await closeAllTunnels();
          },
        });
      },
    },
    messages: {},
  },
});

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
  await closeAllTunnels();
  setTimeout(() => {
    process.exit(0);
  }, 150);
}

process.on("SIGINT", () => handleGracefulQuit());
process.on("SIGTERM", () => handleGracefulQuit());

process.on("uncaughtException", (err) => {
  console.error("[Host Uncaught Exception]", err);
  writeDevErrorLog({
    type: "HOST_UNCAUGHT_EXCEPTION",
    message: err ? err.message : String(err),
    stack: err ? err.stack : undefined,
  });
});

process.on("unhandledRejection", (reason: any) => {
  console.error("[Host Unhandled Rejection]", reason);
  writeDevErrorLog({
    type: "HOST_UNHANDLED_REJECTION",
    message: reason && reason.message ? reason.message : String(reason),
    stack: reason && reason.stack ? reason.stack : undefined,
  });
});

let mainWindow: BrowserWindow;

let storeManaged = false;
try {
  const info = await Updater.getLocalInfo();
  storeManaged = isStoreManaged(info?.identifier);
} catch (err) {
  console.error("[Menu] Could not read updater info; keeping Check For Updates", err);
}

setupApplicationMenu(handleGracefulQuit, (action: string) => {
  if (action === "toggle-devtools") {
    mainWindow?.webview?.toggleDevTools?.();
    return;
  }
  try {
    if (mainWindow && mainWindow.webview) {
      mainWindow.webview.executeJavascript(
        `window.__postbirdMenuAction && window.__postbirdMenuAction(${JSON.stringify(action)})`
      );
    }
  } catch (err) {
    console.error("[Menu Action Forward Error]", err);
  }
}, { checkForUpdates: !storeManaged, applicationMenu: ApplicationMenu, utils: Utils });

if (ContextMenu && typeof ContextMenu.on === "function") {
  ContextMenu.on("context-menu-clicked", (e: any) => {
    const action = e?.data?.action || e?.action;
    if (!action) return;
    try {
      if (mainWindow && mainWindow.webview) {
        mainWindow.webview.executeJavascript(
          `window.__postbirdContextMenuAction && window.__postbirdContextMenuAction(${JSON.stringify(action)})`
        );
      }
    } catch (err) {
      console.error("[ContextMenu Action Forward Error]", err);
    }
  });
}

const savedFrame = loadWindowState();
mainWindow = new BrowserWindow({
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
  const testDb = process.env.POSTBIRD_TEST_DB || "postbird_test";
  const triggerTests = async (attempts = 0) => {
    if (triggered) return;
    try {
      if (mainWindow && mainWindow.webview) {
        const res = await mainWindow.webview.executeJavascript(
          `(() => {
            window.process = window.process || {};
            window.process.env = window.process.env || {};
            window.process.env.POSTBIRD_TEST_DB = ${JSON.stringify(testDb)};
            if (typeof window.__runUITests === "function") {
              window.__runUITests();
              return true;
            }
            return false;
          })()`
        );
        if (res === true) {
          triggered = true;
          console.log(`[Main Process] __runUITests successfully triggered with database: "${testDb}"!`);
          return;
        }
      }
    } catch (err) {
      console.error("[Main Process] Error triggering UI tests:", err);
    }
    if (attempts < 60) {
      setTimeout(() => triggerTests(attempts + 1), 500);
    }
  };
  setTimeout(() => triggerTests(), 1000);
}

if (process.env.POSTBIRD_SCREENSHOT_TOUR === "true") {
  import("../scripts/appstore/screenshot_tour").then(({ startScreenshotTour }) => startScreenshotTour(mainWindow));
}
