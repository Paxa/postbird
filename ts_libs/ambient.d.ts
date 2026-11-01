// Ambient global declarations for Postbird
declare global {
  var EventEmitter2: any;
  var App: any;
  var logger: any;
  var errorReporter: any;
  var SqlSnippets: any;
  var ViewHelpers: any;
  var ViewCellHelpers: any;
  var DOMinate: any;
  var $dom: any;
  var $u: any;
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
