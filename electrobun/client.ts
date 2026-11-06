import { Buffer } from "buffer";

window.Buffer = Buffer;
(globalThis as any).Buffer = Buffer;
if (!window.process) window.process = {};
if (!window.process.versions) window.process.versions = { bun: "1.2.0", node: "22.0.0" };
window.process.nextTick = (fn: any, ...args: any[]) => queueMicrotask(() => (typeof fn === "function" ? fn(...args) : undefined));
if (!(globalThis as any).process) (globalThis as any).process = window.process;
(globalThis as any).process.versions = window.process.versions;
(globalThis as any).process.nextTick = window.process.nextTick;

console.log("[POSTBIRD CLIENT] Initializing Postbird with Buffer polyfill...");
import "../index.js";

window.__runUITests = async () => {
  if (window.__uiTestsRunning) return;
  window.__uiTestsRunning = true;
  console.log("[POSTBIRD CLIENT] Received test trigger from host, running UI tests...");
  const { runUITests } = await import("./ui_tests");
  return runUITests();
};

let isShuttingDown = false;
window.__postbirdGracefulQuit = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("[Graceful Shutdown] Closing all PostgreSQL connections...");
  try {
    if (window.Connection && typeof window.Connection.closeAll === "function") {
      await window.Connection.closeAll();
    }
  } catch (err) {
    console.error("[Graceful Shutdown Error]", err);
  }
  if (window.__postbirdRpc && window.__postbirdRpc.quitApp) {
    await window.__postbirdRpc.quitApp();
  }
};

window.addEventListener("keydown", async (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "q") {
    event.preventDefault();
    event.stopPropagation();
    await window.__postbirdGracefulQuit();
  }
});

window.addEventListener("beforeunload", () => {
  window.__postbirdGracefulQuit();
});

// Prevent default WebKit browser context menu (Reload, Inspect Element) in desktop shell,
// while allowing native system context menu for selected text, inputs, and textareas.
window.addEventListener("contextmenu", (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
    try {
      const range = selection.getRangeAt(0);
      if (target && range.intersectsNode(target)) {
        // Allow native system context menu on selected text (Copy, Look Up, Translate, etc.)
        return;
      }
    } catch {}
  }
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable || target.closest?.(".CodeMirror"))) {
    return;
  }
  event.preventDefault();
});

window.__postbirdMenuAction = (action: string) => {
  const w = window;
  const app = w.App;
  const currentInstance = app?.currentTab?.instance;

  switch (action) {
    case "about-postbird": {
      const help = w.HelpScreen ? w.HelpScreen.open() : null;
      if (help) help.activatePage("about-postbird");
      break;
    }
    case "postbird-help": {
      const help = w.HelpScreen ? w.HelpScreen.open() : null;
      if (help) help.activatePage("get-postgres");
      break;
    }
    case "check-updates": {
      if (w.UpdatesController) {
        new w.UpdatesController().checkUpdates({ showLoading: true, showAlreadyLatest: true });
      }
      break;
    }
    case "new-connection": {
      app?.activateLoginTab?.();
      break;
    }
    case "import-sql": {
      if (w.ImportController) {
        new w.ImportController().doImport();
      }
      break;
    }
    case "reconnect": {
      if (currentInstance?.connection) {
        currentInstance.reconnect();
      } else if (w.alertify) {
        w.alertify.alert("Current tab not connected");
      }
      break;
    }
    case "close-tab": {
      if (app?.tabs?.length > 1) {
        app.closeCurrentTab();
      }
      break;
    }
    case "show-clients": {
      if (currentInstance?.type === "db_screen" && w.ServerController) {
        new w.ServerController().showConnectionList();
      } else if (w.alertify) {
        w.alertify.alert("Please connect to a database first");
      }
      break;
    }
    case "create-db": {
      if (currentInstance?.type === "db_screen" && w.Dialog?.NewDatabase) {
        new w.Dialog.NewDatabase(currentInstance);
      } else if (w.alertify) {
        w.alertify.alert("Please connect to a database first");
      }
      break;
    }
    case "refresh-db": {
      if (currentInstance?.type === "db_screen") {
        currentInstance.fetchTablesAndSchemas?.();
        currentInstance.fetchDbList?.();
      }
      break;
    }
    case "refresh-db-list": {
      if (currentInstance?.type === "db_screen") {
        currentInstance.fetchDbList?.();
      }
      break;
    }
    case "rename-db": {
      if (currentInstance?.type === "db_screen") {
        currentInstance.renameDatabaseDialog?.();
      } else if (w.alertify) {
        w.alertify.alert("Please connect to a database first");
      }
      break;
    }
    case "export-db": {
      if (currentInstance?.type === "db_screen" && w.ExportController) {
        new w.ExportController().doExport();
      } else if (w.alertify) {
        w.alertify.alert("Please connect to a database first");
      }
      break;
    }
    case "drop-db": {
      if (currentInstance?.type === "db_screen") {
        currentInstance.dropDatabaseDialog?.();
      } else if (w.alertify) {
        w.alertify.alert("Please connect to a database first");
      }
      break;
    }
    case "reload-table": {
      if (currentInstance?.type === "db_screen") {
        const tab = currentInstance.currentTab;
        if (tab === "content") {
          currentInstance.view?.contentPane?.reloadData?.();
        } else if (tab === "query") {
          currentInstance.view?.queryPane?.runQuery?.();
        } else if (tab) {
          currentInstance.activateTab?.(tab, "force");
        }
      }
      break;
    }
    case "ai-settings": {
      if (w.Dialog?.AiSettings) {
        new w.Dialog.AiSettings();
      }
      break;
    }
    case "toggle-ai": {
      if (currentInstance?.view?.queryPane?.toggleAiPanel) {
        currentInstance.view.queryPane.toggleAiPanel();
      }
      break;
    }
    case "open-console": {
      if (w.HistoryWindow) {
        new w.HistoryWindow();
      }
      break;
    }
  }
};
