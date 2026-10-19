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
  var global: typeof globalThis & { [key: string]: any };
}

export {};
