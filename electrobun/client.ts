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
