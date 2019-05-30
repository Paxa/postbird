/// <reference path="../node_modules/electron/electron.d.ts" />
/// <reference path="../node_modules/colors/safe.d.ts" />
/// <reference path="../node_modules/moment/moment.d.ts" />
/// <reference path="./codemirror.d.ts" />
/// <reference path="./codemirror_extra.d.ts" />
/// <reference path="./pg_extra.d.ts" />
/// <reference path="./models.d.ts" />
/// <reference path="./panes.d.ts" />
/// <reference path="./dialogs.d.ts" />
/// <reference path="./child_process.d.ts" />

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
  genericTable: GenericTable
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
    SqlImporter: typeof SqlImporter;
    PsqlRunner: typeof PsqlRunner;
    PgDumpRunner: typeof PgDumpRunner;
    SidebarResize: typeof SidebarResize;
    SnippetsWindow: SnippetsWindow;
    ViewHelpers: ViewHelpers;
    App: App;
    Pane: typeof Pane;
    Dialog: typeof Dialog;
    Model: typeof Model;
    logger: Logger;
    TESTING: any;
    errorReporter: (exception: Error, showError?: boolean) => void;
    PgTypeNames: PgTypeNames;
    electron: Electron.RendererInterface;
    HistoryWindow: HistoryWindow;
    ChildProcessExt: ChildProcessExt;
    UpdatesController: typeof UpdatesController;
    ExportController: typeof ExportController;
    ImportController: typeof ImportController;
    $u: JQueryStatic;
    DOMinate (elements: any[]): DOMinateResult;
    $dom (elements: any[]): HTMLElement;
    ResizableColumns: typeof ResizableColumns;
    GenericTable: typeof GenericTable;
    QueryTabResizer: typeof QueryTabResizer;
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
  SidebarResize: typeof SidebarResize;
  $u: JQueryStatic;
  jQuery: JQueryStatic;
  ResizableColumns: typeof ResizableColumns;
  GenericTable: typeof GenericTable;
  QueryTabResizer: typeof QueryTabResizer;
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

interface DOMinateResult {
  [column: string] : HTMLElement
}

declare var logger: Logger;
declare var electron: Electron.RendererInterface;
declare var DOMinate: (elements: any[]) => DOMinateResult;
declare var $dom: (elements: any[]) => HTMLElement;
declare var App: App;
declare var PgTypeNames: PgTypeNames;
declare var errorReporter: (exception: PgError, showError?: boolean) => boolean;
