/// <reference path="../node_modules/electron/electron.d.ts" />
/// <reference path="../node_modules/colors/safe.d.ts" />
/// <reference path="../node_modules/moment/moment.d.ts" />
/// <reference path="./codemirror.d.ts" />
/// <reference path="./codemirror_extra.d.ts" />
/// <reference path="./pg_extra.d.ts" />
/// <reference path="./models.d.ts" />
/// <reference path="./panes.d.ts" />
/// <reference path="./dialogs.d.ts" />

/// DOM extras
interface File {
  path: string;
}

interface HTMLElement {
  href: string
  contextmenu: Electron.Menu
  value: any
  type: string
  autofocus: boolean
  checked: boolean
}

interface Node {
  scrollTop: number
  scrollLeft: number
}

interface EventTarget {
  disabled: boolean
  tagName: string
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
    PaneBase: typeof PaneBase;
    DialogBase: typeof DialogBase;
    ViewHelpers: ViewHelpers;
    App: App;
    Pane: typeof Pane;
    logger: Logger;
    TESTING: any;
    errorReporter: (exception: Error, showError?: boolean) => void;
    PgTypeNames: PgTypeNames;
    electron: Electron.RendererInterface;
    HistoryWindow: any;
  }
}

// Others
declare var $u: JQueryStatic;

declare class Window_Hljs {
  highlightBlock(block: Node) : void
}

interface Window {
  alertify: alertify.IAlertifyStatic
  Mousetrap: MousetrapStatic
  hljs: Window_Hljs
  CodeMirror: Window_CodeMirror
}

interface Window_CodeMirror {
  fromTextArea(host: HTMLTextAreaElement, options?: CodeMirror.EditorConfiguration): CodeMirror.EditorFromTextArea
  hint: any
}

declare namespace Electron {
  interface App {
    ApplicationStart: number;
    mainWindow: BrowserWindow;
  }

  interface Menu {
    clickEvent: PointerEvent
  }
}

declare module alertify {
  interface IAlertifyStatic {
    hide: () => void;
  }
}

declare class ObjectKit {
  static forEach: (data: any, iterator: (k: any, v: any) => void) => void;
}

declare var logger: Logger;
declare var DOMinate: any;
declare var $dom: any;
declare var electron: Electron.RendererInterface;

//declare var LoginScreen: LoginScreen;
declare var App: App;
declare var PgTypeNames: PgTypeNames;

// TODO:

declare var PgDumpRunner: any;
declare var PsqlRunner: any;
declare var SidebarResize: any;
declare var ResizableColumns: any;
declare var GenericTable: any;
declare var QueryTabResizer: any;
declare var errorReporter: (exception: Error, showError?: boolean) => void;
declare var SnippetsWindow: any;