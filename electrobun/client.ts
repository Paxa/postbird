import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;
if (!(window as any).process) (window as any).process = {};
if (!(window as any).process.versions) (window as any).process.versions = { bun: "1.2.0", node: "22.0.0" };
(window as any).process.nextTick = (fn: any, ...args: any[]) => queueMicrotask(() => (typeof fn === "function" ? fn(...args) : undefined));
if (!(globalThis as any).process) (globalThis as any).process = (window as any).process;
(globalThis as any).process.versions = (window as any).process.versions;
(globalThis as any).process.nextTick = (window as any).process.nextTick;

console.log("[POSTBIRD CLIENT] Initializing Postbird with Buffer polyfill...");
import "../index.js";

(window as any).__runUITests = async () => {
  if ((window as any).__uiTestsRunning) return;
  (window as any).__uiTestsRunning = true;
  console.log("[POSTBIRD CLIENT] Received test trigger from host, running UI tests...");
  const { runUITests } = await import("./ui_tests");
  return runUITests();
};

let isShuttingDown = false;
(window as any).__postbirdGracefulQuit = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("[Graceful Shutdown] Closing all PostgreSQL connections...");
  try {
    if ((window as any).Connection && typeof (window as any).Connection.closeAll === "function") {
      await (window as any).Connection.closeAll();
    }
  } catch (err) {
    console.error("[Graceful Shutdown Error]", err);
  }
  if ((window as any).__postbirdRpc && (window as any).__postbirdRpc.quitApp) {
    await (window as any).__postbirdRpc.quitApp();
  }
};

window.addEventListener("keydown", async (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "q") {
    event.preventDefault();
    event.stopPropagation();
    await (window as any).__postbirdGracefulQuit();
  }
});

window.addEventListener("beforeunload", () => {
  (window as any).__postbirdGracefulQuit();
});
