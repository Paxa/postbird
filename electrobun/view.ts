import Electrobun, { Electroview } from "electrobun/view";
import { Buffer } from "buffer";
import type { PostbirdRPC } from "./host/types";

(window as any).Buffer = Buffer;

const rpc = Electroview.defineRPC<PostbirdRPC>({
  maxRequestTime: 30000,
  handlers: { requests: {}, messages: {} },
});

const electroview = new Electrobun.Electroview({ rpc });

// Attach global RPC bridge for postbird
(window as any).__postbirdRpc = {
  query: async (sql: string, config: any, queryOptions?: any) => {
    return await electroview.rpc!.request.query({ sql, config, queryOptions });
  },
  disconnect: async (config: any) => {
    return await electroview.rpc!.request.disconnect({ config });
  },
  spawnProcess: async (params: { bin: string; args: string[]; options?: any }) => {
    return await electroview.rpc!.request.spawnProcess(params);
  },
  finishTests: async (params: { total: number; failed: number }) => {
    return await electroview.rpc!.request.finishTests(params);
  },
  quitApp: async () => {
    return await electroview.rpc!.request.quitApp({});
  },
  getWindowState: async () => {
    return await electroview.rpc!.request.getWindowState({});
  },
  loadSavedConnections: async () => {
    return await electroview.rpc!.request.loadSavedConnections({});
  },
  saveSavedConnections: async (params: { connections: Record<string, any> }) => {
    return await electroview.rpc!.request.saveSavedConnections(params);
  },
  createSshTunnel: async (params: { options: any }) => {
    return await electroview.rpc!.request.createSshTunnel(params);
  },
  closeSshTunnel: async (params: { tunnelId: string }) => {
    return await electroview.rpc!.request.closeSshTunnel(params);
  },
  logDevError: async (params: { type: string; message: string; stack?: string; detail?: string }) => {
    try {
      return await electroview.rpc!.request.logDevError({
        timestamp: new Date().toISOString(),
        ...params,
      });
    } catch {
      return { success: false };
    }
  },
};

// Intercept console.error in webview to automatically record to dev error log
if (typeof console !== "undefined" && typeof console.error === "function") {
  const originalError = console.error;
  console.error = function (...args: any[]) {
    originalError.apply(console, args);
    try {
      const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a, Object.getOwnPropertyNames(a)) : String(a))).join(" ");
      if (typeof window !== "undefined" && (window as any).__postbirdRpc && (window as any).__postbirdRpc.logDevError) {
        (window as any).__postbirdRpc.logDevError({
          type: "CONSOLE_ERROR",
          message: msg,
          stack: new Error().stack,
        }).catch(() => {});
      }
    } catch {}
  };
}

// Polyfill window globals for legacy modules
(window as any).global = window;
(window as any).process = {
  type: "renderer",
  platform: "darwin",
  env: { USER: "pavel" },
  argv: ["electrobun", "postbird"],
  mainModule: { filename: "index.html" },
  on: () => {},
  removeListener: () => {},
  emit: () => {},
  cwd: () => ".",
  nextTick: (fn: any, ...args: any[]) => queueMicrotask(() => (typeof fn === 'function' ? fn(...args) : undefined)),
  stdout: { write: (s: string) => console.log(s) },
  stderr: { write: (s: string) => console.error(s) },
};

console.log("Postbird Electrobun view bridge initialized!");
