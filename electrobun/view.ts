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
        params: { sql: string; config?: any };
        response: QueryResponse;
      };
      disconnect: {
        params: { config?: any };
        response: { success: boolean };
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
  query: async (sql: string, config: any) => {
    return await electroview.rpc!.request.query({ sql, config });
  },
  disconnect: async (config: any) => {
    return await electroview.rpc!.request.disconnect({ config });
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
  nextTick: (fn: any) => queueMicrotask(fn),
  stdout: { write: (s: string) => console.log(s) },
  stderr: { write: (s: string) => console.error(s) },
};

console.log("Postbird Electrobun view bridge initialized!");
