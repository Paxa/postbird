//declare module 'eventemitter2' {
//  declare var EventEmitter2: any
//}
//
//declare module 'electron' {
//  declare var remote: any
//}
//
//declare module 'colors/safe' {
//  declare var remote: any
//  declare var enabled: boolean
//  declare var yellow: any
//  declare var green: any
//}
//
//declare module 'sprintf-js' {
//  declare var vsprintf: any
//}

/// <reference path="../node_modules/electron/electron.d.ts" />
/// <reference path="../node_modules/colors/safe.d.ts" />
/// <reference path="./pg_extra.d.ts" />
/// <reference path="./models.d.ts" />

/// DOM extras
interface File {
  path: string;
}

interface HTMLElement {
  href: string
}

interface ObjectConstructor {
  forEach: (target: any, callback: (key: any, value: any) => void) => void;
}

// Node extras
declare module NodeJS {
  interface Global {
    EventEmitter2: typeof EventEmitter2;
    LoginScreen: typeof LoginScreen;
    Connection: typeof Connection;
    HelpScreen: typeof HelpScreen;
    DbScreen: typeof DbScreen;
    HerokuClient: typeof HerokuClient;
    LoginPostgresUrlForm: typeof LoginPostgresUrlForm;
    LoginStandardForm: typeof LoginStandardForm;
    DbScreenView: typeof DbScreenView;
    ModelBase: typeof ModelBase;
    App: App;
    logger: any;
    log: any;
    TESTING: any;
    errorReporter: (exception: Error, showError?: boolean) => void;
  }
}

// Others
declare var $u: JQueryStatic;

interface Window {
  alertify: alertify.IAlertifyStatic;
  Mousetrap: MousetrapStatic;
}

declare module Electron {
  interface App {
    ApplicationStart: number;
    mainWindow: BrowserWindow;
  }
}

declare module alertify {
  interface IAlertifyStatic {
    hide: () => void;
  }
}

declare var log: any;
declare var DOMinate: any;
declare var $dom: any;
declare var electron: Electron.RendererInterface;

//declare var LoginScreen: LoginScreen;
declare var App: App;

// TODO:

declare var Pane: any;
declare var ObjectKit: any;
declare var logger: any;
declare var PgDumpRunner: any;
declare var PsqlRunner: any;
declare var Dialog: any;
declare var SidebarResize: any;
declare var errorReporter: (exception: Error, showError?: boolean) => void;
