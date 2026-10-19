import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

console.log("[POSTBIRD CLIENT] Initializing Postbird with Buffer polyfill...");
import "../index.js";
