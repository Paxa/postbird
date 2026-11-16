// Ambient global declarations for Postbird
declare global {
  var EventEmitter2: any;
  var App: any;
  var logger: any;
  var errorReporter: any;
  var SqlSnippets: any;
  var ViewHelpers: any;
  var ViewCellHelpers: any;
  var dom: any;
  var htmlToElement: <T extends HTMLElement = HTMLElement>(html: string) => T;
  var buildOption: (label: string, value?: string | any, options?: Record<string, any>) => HTMLOptionElement;
  var $u: any;
  var electron: any;
  var electronRemote: any;
  var Menu: any;
  var MenuItem: any;
  var testConnection: any;
  var cleanupSchema: any;
  var TestHelper: any;
  var getConnection: any;
  var assert: any;
  var pg_proc: any;
  var node: any;
  var Sparkline: any;
  var Monitor__: any;
  var global: typeof globalThis & { [key: string]: any };

  interface JQuery {
    forEach: (handler: Function) => void;
    single_double_click_nowait: (single_click_cb: Function, double_click_cb: Function, timeout?: number) => void;
    single_double_click: (single_click_cb: Function, double_click_cb: Function, timeout?: number) => void;
    removeChildren: () => JQuery;
    fasterAppend: (nodes: any) => void;
  }

  interface Error {
    query?: string;
    messageHint?: string;
    detail?: string;
    sshStatus?: string;
    dbStatus?: string;
    originalHost?: string;
    originalPort?: number | string;
  }

  interface QueryResult {
    time?: number;
  }

  interface Window {
    Buffer: any;
    process: any;
    __runUITests: any;
    __uiTestsRunning: boolean;
    __postbirdGracefulQuit: any;
    __postbirdRpc: any;
    __postbirdMenuAction: any;
    Connection: any;
  }
}

declare module "electrobun/main" {
  export type RPCSchema<T = any> = any;
  export class BrowserView {
    static defineRPC<T = any>(options: any): any;
  }
  export class BrowserWindow {
    constructor(options: any);
    webview: any;
    on(event: string, handler: Function): void;
    frame: any;
    getFrame(): any;
    isMaximized(): boolean;
    isFullScreen(): boolean;
  }
  export class ApplicationMenu {
    static setApplicationMenu(menu: any[]): void;
    static on(event: string, handler: (e: any) => void): void;
  }
  export class ContextMenu {
    static showContextMenu(menu: any[]): void;
    static on(event: string, handler: (e: any) => void): void;
  }
  export const Utils: {
    openFileDialog(options?: {
      startingFolder?: string;
      allowedFileTypes?: string;
      canChooseFiles?: boolean;
      canChooseDirectory?: boolean;
      allowsMultipleSelection?: boolean;
    }): Promise<string[]>;
    showMessageBox(options?: {
      type?: "info" | "warning" | "error" | "question";
      title?: string;
      message?: string;
      detail?: string;
      buttons?: string[];
      defaultId?: number;
      cancelId?: number;
    }): Promise<{ response: number }>;
    openExternal(url: string): boolean;
    openPath(path: string): boolean;
    showItemInFolder(path: string): void;
    clipboardReadText(): string | null;
    clipboardWriteText(text: string): void;
    paths: Record<string, string>;
  };
  export const Updater: {
    getLocalInfo(): Promise<{
      version: string;
      hash: string;
      baseUrl: string;
      channel: string;
      name: string;
      displayName?: string;
      identifier: string;
    }>;
    checkForUpdate(): Promise<{
      version: string;
      hash: string;
      updateAvailable: boolean;
      updateReady: boolean;
      error: string;
    }>;
    downloadUpdate(): Promise<void>;
    applyUpdate(): Promise<void>;
    updateInfo(): {
      version: string;
      hash: string;
      updateAvailable: boolean;
      updateReady: boolean;
      error: string;
    };
    onStatusChange(callback: ((entry: any) => void) | null): void;
  };
}

declare module "electrobun/view" {
  export class Electroview {
    static defineRPC<T = any>(options: any): any;
  }
  export default class Electrobun {
    static Electroview: any;
    constructor(options: any);
    rpc?: any;
  }
}

export {};
