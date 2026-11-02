import { BrowserView, BrowserWindow } from "electrobun/main";
import type { PostbirdRPC } from "./host/types";
import { executeQuery, disconnectPool, closeAllPools } from "./host/db_pool";
import { createSshTunnel, closeSshTunnel, closeAllTunnels } from "./host/ssh_tunnel";
import { writeDevErrorLog } from "./host/dev_logger";
import {
  loadSavedConnections,
  saveSavedConnections,
  loadWindowState,
  saveWindowState,
  debounce,
} from "./host/storage";
import { spawnProcess } from "./host/process_runner";
import { setupApplicationMenu } from "./host/menu";

const postbirdRPC = BrowserView.defineRPC<PostbirdRPC>({
  maxRequestTime: 30000,
  handlers: {
    requests: {
      query: async ({ sql, config, queryOptions }) => {
        return executeQuery(sql, config, queryOptions);
      },

      disconnect: async ({ config }) => {
        return disconnectPool(config);
      },

      spawnProcess: async ({ bin, args, options }) => {
        return spawnProcess({ bin, args, options });
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

setupApplicationMenu(handleGracefulQuit);

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
