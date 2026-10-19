// @ts-nocheck
import Electrobun, { Electroview } from "electrobun/view";
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

type QueryResponse = {
  command: string;
  rowCount: number;
  rows: any[];
  fields: any[];
  time?: number;
};

type PostbirdRPC = {
  bun: {
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
    };
    messages: {};
  };
  webview: {
    requests: {};
    messages: {};
  };
};

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
};

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
