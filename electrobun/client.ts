import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

console.log("[POSTBIRD CLIENT] Initializing Postbird with Buffer polyfill...");
import "../index.js";

if (process.env.POSTBIRD_TEST_UI === "true") {
  console.log("[POSTBIRD CLIENT] Test mode active, queuing UI test runner...");
  import("./ui_tests").then(({ runUITests }) => {
    $(document).ready(() => {
      setTimeout(() => {
        runUITests().catch((err: any) => {
          console.error("[UI Test Error]", err);
        });
      }, 800);
    });
  });
}

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
