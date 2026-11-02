import type { RPCSchema } from "electrobun/main";

export type QueryResponse = {
  command: string;
  rowCount: number;
  rows: any[];
  fields: any[];
  time?: number;
};

export type WindowFrameState = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export type PostbirdRPC = {
  bun: RPCSchema<{
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
        params: Record<string, never>;
        response: { success: boolean };
      };
      getWindowState: {
        params: Record<string, never>;
        response: WindowFrameState;
      };
      loadSavedConnections: {
        params: Record<string, never>;
        response: { connections: Record<string, any>; source: string };
      };
      saveSavedConnections: {
        params: { connections: Record<string, any> };
        response: { success: boolean };
      };
      createSshTunnel: {
        params: { options: any };
        response: { tunnelId: string; host: string; port: number; error?: string };
      };
      closeSshTunnel: {
        params: { tunnelId: string };
        response: { success: boolean };
      };
      logDevError: {
        params: { type: string; message: string; stack?: string; detail?: string; timestamp?: string };
        response: { success: boolean };
      };
    };
    messages: Record<string, never>;
  }>;
  webview: RPCSchema<{
    requests: Record<string, never>;
    messages: Record<string, never>;
  }>;
};
