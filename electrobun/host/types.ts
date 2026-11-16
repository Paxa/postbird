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

export type ContextMenuItemConfig = {
  type?: "normal" | "separator" | "divider";
  label?: string;
  role?: string;
  action?: string;
  enabled?: boolean;
  checked?: boolean;
  hidden?: boolean;
  submenu?: ContextMenuItemConfig[];
};

export type UpdateCheckResponse = {
  currentVersion: string;
  latestVersion: string;
  publishedAt?: string;
  updateAvailable: boolean;
  updateReady: boolean;
  canAutoUpdate: boolean;
  releasesPage: string;
  error?: string;
};

export type UpdateInstallResponse = {
  success: boolean;
  applied: boolean;
  fallbackUrl?: string;
  error?: string;
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
        params: { bin: string; args: string[]; options?: any; streamId?: string };
        response: { code: number; stdout: string; stderr: string; streamed?: boolean };
      };
      killProcess: {
        params: { streamId: string };
        response: { success: boolean };
      };
      discoverAiProviders: {
        params: { customEndpoints?: any[] };
        response: any[];
      };
      verifyAiProvider: {
        params: { providerId: string; model?: string; baseUrl?: string; apiKey?: string; path?: string };
        response: { ok: boolean; message: string; models?: string[]; latencyMs?: number };
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
      logAi: {
        params: { level: "info" | "warn" | "error" | "debug"; message: string; detail?: string; timestamp?: string };
        response: { success: boolean };
      };
      openFileDialog: {
        params: {
          startingFolder?: string;
          allowedFileTypes?: string;
          canChooseFiles?: boolean;
          canChooseDirectory?: boolean;
          allowsMultipleSelection?: boolean;
        };
        response: { canceled: boolean; filePaths: string[] };
      };
      saveFileDialog: {
        params: {
          title?: string;
          message?: string;
          defaultPath?: string;
        };
        response: { canceled: boolean; filePath: string | null };
      };
      writeFile: {
        params: { filePath: string; content: string };
        response: { success: boolean; error?: string };
      };
      openExternal: {
        params: { url: string };
        response: { success: boolean };
      };
      showContextMenu: {
        params: { items: ContextMenuItemConfig[] };
        response: { success: boolean; fallback?: boolean };
      };
      checkForUpdates: {
        params: Record<string, never>;
        response: UpdateCheckResponse;
      };
      installUpdate: {
        params: Record<string, never>;
        response: UpdateInstallResponse;
      };
    };
    messages: Record<string, never>;
  }>;
  webview: RPCSchema<{
    requests: Record<string, never>;
    messages: Record<string, never>;
  }>;
};
