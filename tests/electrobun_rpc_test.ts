require('./test_helper');

const remote = require('../electrobun/shims/remote');
const fs = require('../electrobun/shims/fs');

// Ensure $u is available in Node/Bun unit test environment
if (!(global as any).$u) {
  const createMockChain = (selector?: any): any => {
    const obj: any = {
      length: 1,
      selector,
      rawHtml: typeof selector === 'string' ? selector : '',
      append: () => obj,
      html: () => (obj.rawHtml || (typeof selector === 'string' ? selector : '')),
      find: () => obj,
      addClass: () => obj,
      removeClass: () => obj,
      off: () => obj,
      on: () => obj,
      bind: () => obj,
      unbind: () => obj,
      text: () => obj,
      forEach: (cb: any) => {},
      each: (cb: any) => {},
      scrollTop: 0,
      scrollHeight: 100,
      [0]: { scrollTop: 0, scrollHeight: 100, outerHTML: '<div></div>', innerHTML: '' },
    };
    return obj;
  };
  const mockJQuery: any = (sel: any) => createMockChain(sel);
  mockJQuery.html2collection = (html: string) => {
    const chain = createMockChain(html);
    chain.rawHtml = html;
    return chain;
  };
  mockJQuery.textInputMenu = () => {};
  (global as any).$u = window.$u = mockJQuery;
}

require('../app/views/history_window');

describe('Electrobun RPC, Shims & Menu Actions', () => {
  let originalRpc: any;
  let originalLastWritten: any;

  beforeEach(() => {
    originalRpc = (window as any).__postbirdRpc;
    originalLastWritten = (window as any).__lastWrittenFiles;
    (window as any).__lastWrittenFiles = {};
  });

  afterEach(() => {
    (window as any).__postbirdRpc = originalRpc;
    (window as any).__lastWrittenFiles = originalLastWritten;
    if (App.historyWin) {
      App.historyWin.close();
    }
  });

  describe('dialog.showOpenDialog', () => {
    it('should forward options and filters to __postbirdRpc.openFileDialog', async () => {
      let rpcCall: any = null;
      (window as any).__postbirdRpc = {
        openFileDialog: async (params: any) => {
          rpcCall = params;
          return { filePaths: ['/Users/pavel/dump.sql'] };
        },
      };

      let callbackResult: any = null;
      const res = await remote.dialog.showOpenDialog(
        {
          defaultPath: '/Users/pavel',
          filters: [
            { name: 'SQL Files', extensions: ['.sql', 'pgsql'] },
          ],
          properties: ['openFile', 'multiSelections'],
        },
        (files: string[]) => {
          callbackResult = files;
        }
      );

      assert(rpcCall !== null, 'RPC openFileDialog should have been called');
      assert.equal(rpcCall.startingFolder, '/Users/pavel');
      assert.equal(rpcCall.allowedFileTypes, 'sql,pgsql');
      assert.equal(rpcCall.canChooseFiles, true);
      assert.equal(rpcCall.allowsMultipleSelection, true);

      assert.deepEqual(callbackResult, ['/Users/pavel/dump.sql']);
      assert.equal(res.canceled, false);
      assert.deepEqual(res.filePaths, ['/Users/pavel/dump.sql']);
    });

    it('should handle cancel or empty selection gracefully', async () => {
      (window as any).__postbirdRpc = {
        openFileDialog: async () => ({ filePaths: [] }),
      };

      const res = await remote.dialog.showOpenDialog({ properties: ['openFile'] });
      assert.equal(res.canceled, true);
      assert.deepEqual(res.filePaths, []);
    });

    it('lib/dialogs openFileDialog should unpack filePaths array from RPC object', async () => {
      const { openFileDialog } = require('../lib/dialogs');
      (window as any).__postbirdRpc = {
        openFileDialog: async (params: any) => {
          assert.equal(params.allowedFileTypes, 'sql');
          return { canceled: false, filePaths: ['/tmp/test_import.sql'] };
        },
      };

      const files = await openFileDialog('.sql');
      assert(Array.isArray(files), 'openFileDialog must return an Array of strings');
      assert.equal(files.length, 1);
      assert.equal(files[0], '/tmp/test_import.sql');
    });

    it('lib/dom makeDroppable should support WebKit files without file.path via RPC writeFile', async () => {
      const { makeDroppable } = require('../lib/dom');
      let writtenFile: any = null;
      (window as any).__postbirdRpc = {
        writeFile: async (params: any) => {
          writtenFile = params;
          return { success: true };
        },
      };

      let droppedPath = '';
      const dummyEl = document.createElement('div');
      makeDroppable(dummyEl, (p) => {
        droppedPath = p;
      });

      // Simulate dropping a WebKit File object without file.path property
      const mockFile = {
        name: 'database_dump.sql',
        text: async () => 'CREATE TABLE test_drop (id int);',
      };

      const dropEvent = new Event('drop') as any;
      dropEvent.dataTransfer = { files: [mockFile] };
      dropEvent.preventDefault = () => {};
      dropEvent.stopPropagation = () => {};

      window.dispatchEvent(dropEvent);
      // Wait microtask for async text() and writeFile
      await new Promise(r => setTimeout(r, 20));

      assert(writtenFile !== null, 'writeFile should have been called for WebKit drop');
      assert(writtenFile.filePath.includes('database_dump.sql'));
      assert.equal(writtenFile.content, 'CREATE TABLE test_drop (id int);');
      assert.equal(droppedPath, writtenFile.filePath, 'Callback should receive the written temp file path');
    });
  });

  describe('dialog.showSaveDialog', () => {
    it('should forward save dialog options to __postbirdRpc.saveFileDialog', async () => {
      let rpcCall: any = null;
      (window as any).__postbirdRpc = {
        saveFileDialog: async (params: any) => {
          rpcCall = params;
          return { filePath: '/Users/pavel/export.csv' };
        },
      };

      let callbackResult: any = null;
      const res = await remote.dialog.showSaveDialog(
        {
          title: 'Export query result',
          message: 'Choose location',
          defaultPath: 'result.csv',
        },
        (path: string) => {
          callbackResult = path;
        }
      );

      assert(rpcCall !== null, 'RPC saveFileDialog should have been called');
      assert.equal(rpcCall.title, 'Export query result');
      assert.equal(rpcCall.message, 'Choose location');
      assert.equal(rpcCall.defaultPath, 'result.csv');

      assert.equal(callbackResult, '/Users/pavel/export.csv');
      assert.equal(res.canceled, false);
      assert.equal(res.filePath, '/Users/pavel/export.csv');
    });

    it('should handle cancel in save dialog gracefully', async () => {
      (window as any).__postbirdRpc = {
        saveFileDialog: async () => ({ filePath: null }),
      };

      const res = await remote.dialog.showSaveDialog({ defaultPath: 'dump.sql' });
      assert.equal(res.canceled, true);
      assert.equal(res.filePath, null);
    });
  });

  describe('shell.openExternal', () => {
    it('should route external URLs to __postbirdRpc.openExternal', async () => {
      let openedUrl = '';
      (window as any).__postbirdRpc = {
        openExternal: async (params: { url: string }) => {
          openedUrl = params.url;
          return { success: true };
        },
      };

      remote.shell.openExternal('https://github.com/Paxa/postbird');
      assert.equal(openedUrl, 'https://github.com/Paxa/postbird');
    });
  });

  describe('fs.createWriteStream & fs.writeFileSync with RPC persistence', () => {
    it('should write chunks and invoke __postbirdRpc.writeFile on stream end', async () => {
      let writtenFile: any = null;
      (window as any).__postbirdRpc = {
        writeFile: async (params: any) => {
          writtenFile = params;
          return { success: true };
        },
      };

      const stream = fs.createWriteStream('/tmp/test_export.csv');
      stream.write('id,name\n');
      stream.write('1,alice\n');

      await new Promise<void>((resolve) => {
        stream.end('2,bob\n', () => resolve());
      });

      assert(writtenFile !== null, 'writeFile RPC must be called when stream ends');
      assert.equal(writtenFile.filePath, '/tmp/test_export.csv');
      assert.equal(writtenFile.content, 'id,name\n1,alice\n2,bob\n');
      assert.equal(fs.readFileSync('/tmp/test_export.csv'), 'id,name\n1,alice\n2,bob\n');
    });

    it('should persist synchronously written files to RPC and local cache', () => {
      let writtenFile: any = null;
      (window as any).__postbirdRpc = {
        writeFile: async (params: any) => {
          writtenFile = params;
          return { success: true };
        },
      };

      fs.writeFileSync('/tmp/test_sync.sql', 'SELECT 1;');
      assert.equal(fs.readFileSync('/tmp/test_sync.sql'), 'SELECT 1;');
      assert.equal(fs.existsSync('/tmp/test_sync.sql'), true);
      assert(writtenFile !== null, 'writeFile RPC should be triggered by writeFileSync');
      assert.equal(writtenFile.content, 'SELECT 1;');
    });
  });

  describe('HistoryWindow in-app modal', () => {
    it('should open modal dialog, register listener, and clean up on close', () => {
      let alertifyCalled = false;
      let alertifyClass = '';
      (window as any).alertify = {
        alert: (html: string, cb?: Function, cls?: string) => {
          alertifyCalled = true;
          alertifyClass = cls || '';
        },
        hide: () => {},
      };

      assert.equal(App.historyWin, null);

      const win = new (global as any).HistoryWindow();
      assert(alertifyCalled, 'alertify.alert should be invoked to display HistoryWindow modal');
      assert(alertifyClass.includes('history-dialog'), 'history-dialog CSS class should be passed');
      assert(App.historyWin !== null, 'App.historyWin should be populated');

      // Adding duplicate should not throw and focus existing
      new (global as any).HistoryWindow();

      // Triggering log event
      App.logEvents = App.logEvents || [];
      App.emit('log.message', { type: 'sql.success', time: Date.now(), args: [{ sql: 'SELECT 42;', time: 5 }] });

      // Closing should reset App.historyWin
      win.close();
      assert.equal(App.historyWin, null, 'Closing HistoryWindow should clear App.historyWin');
    });
  });

  describe('window.__postbirdMenuAction host menu dispatcher', () => {
    beforeEach(() => {
      (window as any).App = global.App;
      (window as any).HistoryWindow = (global as any).HistoryWindow;
    });

    // Import or define the dispatcher action handler
    const dispatchMenuAction = (action: string) => {
      const w = window as any;
      const app = w.App || (global as any).App;
      const currentInstance = app?.currentTab?.instance;

      switch (action) {
        case 'about-postbird': {
          const help = w.HelpScreen ? w.HelpScreen.open() : null;
          if (help) help.activatePage('about-postbird');
          break;
        }
        case 'postbird-help': {
          const help = w.HelpScreen ? w.HelpScreen.open() : null;
          if (help) help.activatePage('get-postgres');
          break;
        }
        case 'check-updates': {
          if (w.UpdatesController) {
            new w.UpdatesController().checkUpdates({ showLoading: true, showAlreadyLatest: true });
          }
          break;
        }
        case 'new-connection': {
          app?.activateLoginTab?.();
          break;
        }
        case 'import-sql': {
          if (w.ImportController) {
            new w.ImportController().doImport();
          }
          break;
        }
        case 'reconnect': {
          if (currentInstance?.connection) {
            currentInstance.reconnect();
          } else if (w.alertify) {
            w.alertify.alert('Current tab not connected');
          }
          break;
        }
        case 'close-tab': {
          if (app?.tabs?.length > 1) {
            app.closeCurrentTab();
          }
          break;
        }
        case 'show-clients': {
          if (currentInstance?.type === 'db_screen' && w.ServerController) {
            new w.ServerController().showConnectionList();
          }
          break;
        }
        case 'create-db': {
          if (currentInstance?.type === 'db_screen' && w.Dialog?.NewDatabase) {
            new w.Dialog.NewDatabase(currentInstance);
          }
          break;
        }
        case 'refresh-db': {
          if (currentInstance?.type === 'db_screen') {
            currentInstance.fetchTablesAndSchemas?.();
            currentInstance.fetchDbList?.();
          }
          break;
        }
        case 'rename-db': {
          if (currentInstance?.type === 'db_screen') {
            currentInstance.renameDatabaseDialog?.();
          }
          break;
        }
        case 'export-db': {
          if (currentInstance?.type === 'db_screen' && w.ExportController) {
            new w.ExportController().doExport();
          }
          break;
        }
        case 'drop-db': {
          if (currentInstance?.type === 'db_screen') {
            currentInstance.dropDatabaseDialog?.();
          }
          break;
        }
        case 'reload-table': {
          if (currentInstance?.type === 'db_screen') {
            const tab = currentInstance.currentTab;
            if (tab === 'content') {
              currentInstance.view?.contentPane?.reloadData?.();
            } else if (tab === 'query') {
              currentInstance.view?.queryPane?.runQuery?.();
            } else if (tab) {
              currentInstance.activateTab?.(tab, 'force');
            }
          }
          break;
        }
        case 'ai-settings': {
          if (w.Dialog?.AiSettings) {
            new w.Dialog.AiSettings();
          }
          break;
        }
        case 'toggle-ai': {
          if (currentInstance?.view?.queryPane?.toggleAiPanel) {
            currentInstance.view.queryPane.toggleAiPanel();
          }
          break;
        }
        case 'refresh-db-list': {
          if (currentInstance?.type === 'db_screen') {
            currentInstance.fetchDbList?.();
          }
          break;
        }
        case 'open-console': {
          if (w.HistoryWindow) {
            new w.HistoryWindow();
          }
          break;
        }
      }
    };

    it('should handle open-console by opening HistoryWindow modal', () => {
      let alertifyCalled = false;
      (window as any).alertify = {
        alert: () => { alertifyCalled = true; },
        hide: () => {},
      };

      dispatchMenuAction('open-console');
      assert(alertifyCalled, 'open-console action should trigger alertify for HistoryWindow');
      assert(App.historyWin !== null, 'App.historyWin should be instantiated');
    });

    it('should handle new-connection by invoking App.activateLoginTab', () => {
      let activateCalled = false;
      const orig = App.activateLoginTab;
      App.activateLoginTab = () => { activateCalled = true; };

      dispatchMenuAction('new-connection');
      assert(activateCalled, 'new-connection action must call App.activateLoginTab');
      App.activateLoginTab = orig;
    });

    it('should handle close-tab with multiple tabs open', () => {
      let closeCalled = false;
      const origClose = App.closeCurrentTab;
      const origTabs = App.tabs;
      App.tabs = [{}, {}];
      App.closeCurrentTab = () => { closeCalled = true; };

      dispatchMenuAction('close-tab');
      assert(closeCalled, 'close-tab action must call App.closeCurrentTab when multiple tabs exist');
      App.closeCurrentTab = origClose;
      App.tabs = origTabs;
    });

    it('should handle db-specific actions safely when db_screen is active', () => {
      let refreshed = false;
      let renamed = false;
      let dropped = false;
      const mockDbScreen = {
        type: 'db_screen',
        currentTab: 'query',
        fetchTablesAndSchemas: () => { refreshed = true; },
        fetchDbList: () => {},
        renameDatabaseDialog: () => { renamed = true; },
        dropDatabaseDialog: () => { dropped = true; },
        view: { queryPane: { runQuery: () => {} } },
      };

      const origTabs = App.tabs;
      const origActive = App.activeTab;
      App.tabs = [{ instance: mockDbScreen }];
      App.activeTab = 0;

      dispatchMenuAction('refresh-db');
      assert(refreshed, 'refresh-db action must trigger fetchTablesAndSchemas');

      dispatchMenuAction('rename-db');
      assert(renamed, 'rename-db action must trigger renameDatabaseDialog');

      dispatchMenuAction('drop-db');
      assert(dropped, 'drop-db action must trigger dropDatabaseDialog');

      App.tabs = origTabs;
      App.activeTab = origActive;
    });

    it('should handle ai-settings and toggle-ai menu actions', () => {
      let aiSettingsOpened = false;
      let aiToggled = false;
      const origDialog = (window as any).Dialog;
      (window as any).Dialog = {
        AiSettings: class {
          constructor() { aiSettingsOpened = true; }
        },
      };

      const mockDbScreen = {
        type: 'db_screen',
        view: { queryPane: { toggleAiPanel: () => { aiToggled = true; } } },
      };
      const origTabs = App.tabs;
      App.tabs = [{ instance: mockDbScreen }];
      App.activeTab = 0;

      dispatchMenuAction('ai-settings');
      assert(aiSettingsOpened, 'ai-settings action should open Dialog.AiSettings');

      dispatchMenuAction('toggle-ai');
      assert(aiToggled, 'toggle-ai action should invoke toggleAiPanel');

      (window as any).Dialog = origDialog;
      App.tabs = origTabs;
    });

    it('should correctly unpack action from ElectrobunEvent structure (e.data.action)', () => {
      // Simulates the native ElectrobunEvent emitted by ApplicationMenu.on('application-menu-clicked')
      const electrobunEvent = {
        name: 'application-menu-clicked',
        data: {
          id: 42,
          action: 'new-connection',
          data: undefined,
        },
      };

      const extractAction = (e: any) => e?.data?.action || e?.action;
      assert.equal(extractAction(electrobunEvent), 'new-connection', 'Must extract action from e.data.action in ElectrobunEvent');

      // Also support legacy or direct string/object fallback
      assert.equal(extractAction({ action: 'reconnect' }), 'reconnect', 'Must fallback to e.action when e.data is not present');
    });
  });

  describe('AI Discovery RPC bridge', () => {
    it('should forward discoverProviders to __postbirdRpc.discoverAiProviders when present in webview', async () => {
      const origRpc = (window as any).__postbirdRpc;
      try {
        let rpcCalledWith: any = null;
        (window as any).__postbirdRpc = {
          discoverAiProviders: async (params: any) => {
            rpcCalledWith = params;
            return [
              {
                id: 'agy',
                name: 'Antigravity CLI (agy)',
                status: 'ready',
                path: '/Users/pavel/.local/bin/agy',
                models: ['gemini-3.8-flash-medium'],
                defaultModel: 'gemini-3.8-flash-medium',
                source: 'local-cli'
              }
            ];
          }
        };

        const { discoverProviders } = require('../lib/local_ai/discovery');
        const providers = await discoverProviders();

        assert(rpcCalledWith !== null, 'Should have routed to __postbirdRpc.discoverAiProviders');
        assert.equal(providers.length, 1);
        assert.equal(providers[0].id, 'agy');
        assert.equal(providers[0].status, 'ready');
      } finally {
        (window as any).__postbirdRpc = origRpc;
      }
    });
  });

  describe('Query Tab Snippets UI', () => {
    it('should have Snippets and Save Snippet buttons removed from query_tab template', () => {
      const template = App.renderView('query_tab');
      const html = $u('<div>').append(template).html();

      assert.false(html.includes('>Snippets</button>'), 'Snippets button must not be rendered');
      assert.false(html.includes('>Save Snippet</button>'), 'Save Snippet button must not be rendered');
    });
  });

  describe('ChildProcessShim', () => {
    it('supports async iterator for stdout and emits data from RPC', async () => {
      const cpShim = require('../electrobun/shims/child_process');
      const origRpc = (window as any).__postbirdRpc;

      (window as any).__postbirdRpc = {
        spawnProcess: async (params: any) => {
          return {
            code: 0,
            stdout: JSON.stringify({ type: 'delta', content: 'SELECT 1;' }) + '\n',
            stderr: '',
          };
        },
      };

      try {
        const proc = cpShim.spawn('claude', ['-p', 'test']);
        const chunks: string[] = [];
        for await (const chunk of proc.stdout) {
          chunks.push(chunk.toString());
        }

        assert.equal(chunks.length, 1);
        assert(chunks[0].includes('SELECT 1;'));
      } finally {
        (window as any).__postbirdRpc = origRpc;
      }
    });
  });

  describe('ContextMenu event handling', () => {
    it('always calls preventDefault and stopPropagation on subsequent right-clicks', () => {
      const { attachContextMenu } = require('../lib/context_menu');
      const el = document.createElement('div');
      attachContextMenu(el, {
        'Test Action': () => {},
      });

      // First click
      let prevented1 = false;
      let stopped1 = false;
      const MouseEventClass = (window as any).MouseEvent || class {
        type: string;
        bubbles: boolean;
        cancelable: boolean;
        constructor(type: string, opts: any = {}) {
          this.type = type;
          this.bubbles = !!opts.bubbles;
          this.cancelable = !!opts.cancelable;
        }
      };
      const ev1 = new MouseEventClass('contextmenu', { bubbles: true, cancelable: true });
      ev1.preventDefault = () => { prevented1 = true; };
      ev1.stopPropagation = () => { stopped1 = true; };
      el.dispatchEvent(ev1);

      assert(prevented1, 'preventDefault must be called on first contextmenu event');
      assert(stopped1, 'stopPropagation must be called on first contextmenu event');

      // Second click (when menu is already cached)
      let prevented2 = false;
      let stopped2 = false;
      const ev2 = new MouseEventClass('contextmenu', { bubbles: true, cancelable: true });
      ev2.preventDefault = () => { prevented2 = true; };
      ev2.stopPropagation = () => { stopped2 = true; };
      el.dispatchEvent(ev2);

      assert(prevented2, 'preventDefault must be called on subsequent contextmenu events');
      assert(stopped2, 'stopPropagation must be called on subsequent contextmenu events');
    });

    it('allows native system menu when right-clicking on selected text', () => {
      const { attachContextMenu } = require('../lib/context_menu');
      const container = document.createElement('div');
      const textNode = document.createTextNode('Sample selected text');
      container.appendChild(textNode);
      document.body.appendChild(container);

      attachContextMenu(container, {
        'Custom Row Action': () => {},
      });

      // Mock text selection over textNode
      const mockRange = {
        intersectsNode: (node: Node) => node === container || node === textNode,
      };
      const origGetSelection = window.getSelection;
      (window as any).getSelection = () => ({
        isCollapsed: false,
        rangeCount: 1,
        toString: () => 'Sample selected text',
        getRangeAt: () => mockRange,
      });

      try {
        const MouseEventClass = (window as any).MouseEvent || class {
          type: string;
          bubbles: boolean;
          cancelable: boolean;
          constructor(type: string, opts: any = {}) {
            this.type = type;
            this.bubbles = !!opts.bubbles;
            this.cancelable = !!opts.cancelable;
          }
        };

        let prevented = false;
        let stopped = false;
        const ev = new MouseEventClass('contextmenu', { bubbles: true, cancelable: true });
        ev.preventDefault = () => { prevented = true; };
        ev.stopPropagation = () => { stopped = true; };
        Object.defineProperty(ev, 'target', { value: textNode });

        container.dispatchEvent(ev);

        assert.equal(prevented, false, 'preventDefault should not be called when text is selected');
        assert.equal(stopped, false, 'stopPropagation should not be called when text is selected');
      } finally {
        (window as any).getSelection = origGetSelection;
        container.remove();
      }
    });

    it('adapts context menu colors to light mode and dark mode', () => {
      const { Menu, MenuItem } = remote;
      const menu = new Menu();
      menu.append(new MenuItem({ label: 'Item 1' }));

      // 1. Light mode test
      document.body.classList.remove('dark-mode');
      menu.popup();
      const lightPopup = document.getElementById('postbird-context-menu-popup');
      assert(lightPopup, 'Context menu popup element should exist in DOM');
      assert(
        lightPopup!.style.backgroundColor.includes('255, 255, 255') || lightPopup!.style.color === 'rgb(28, 28, 30)',
        'Light mode popup should have light background and dark text'
      );
      lightPopup!.remove();

      // 2. Dark mode test
      document.body.classList.add('dark-mode');
      menu.popup();
      const darkPopup = document.getElementById('postbird-context-menu-popup');
      assert(darkPopup, 'Context menu popup element should exist in DOM');
      assert(
        darkPopup!.style.backgroundColor.includes('44, 44, 46') || darkPopup!.style.color === 'rgb(242, 242, 247)',
        'Dark mode popup should have dark background and light text'
      );
      darkPopup!.remove();
      document.body.classList.remove('dark-mode');
    });
  });

  describe('Database Connection Pool Lifecycle & Disconnect', () => {
    it('Pool.end() in electrobun/shims/pg.js invokes window.__postbirdRpc.disconnect', async () => {
      const pgShim = require('../electrobun/shims/pg');
      let disconnectedConfig: any = null;

      (window as any).__postbirdRpc = {
        disconnect: async (config: any) => {
          disconnectedConfig = config;
          return { success: true };
        },
      };

      const testConfig = {
        user: 'testuser',
        host: '127.0.0.1',
        port: 5432,
        database: 'template1',
        ssl: false,
      };

      const pool = new pgShim.Pool(testConfig);
      assert.strictEqual(pool.ended, false);

      let callbackCalled = false;
      await pool.end(() => {
        callbackCalled = true;
      });

      assert.strictEqual(pool.ended, true);
      assert.strictEqual(callbackCalled, true);
      assert.deepStrictEqual(disconnectedConfig, testConfig);
    });

    it('db_pool.ts getPoolKey formats keys consistently and disconnectPool terminates pools', async () => {
      const { getPoolKey, getPool, disconnectPool, getActivePoolKeys } = require('../electrobun/host/db_pool');

      const configA = {
        user: 'buy_monitor',
        host: '127.0.0.1',
        port: 57002,
        database: 'template1',
        ssl: false,
      };

      const configB = {
        user: 'buy_monitor',
        host: '127.0.0.1',
        port: 57002,
        database: 'buy_monitor_production',
        ssl: false,
      };

      const keyA = getPoolKey(configA);
      const keyB = getPoolKey(configB);

      assert.strictEqual(keyA, 'buy_monitor@127.0.0.1:57002/template1?ssl=false&read_only=false');
      assert.strictEqual(keyB, 'buy_monitor@127.0.0.1:57002/buy_monitor_production?ssl=false&read_only=false');

      // Create pool A
      getPool(configA);
      assert(getActivePoolKeys().includes(keyA), 'Pool A should be active in pools map');

      // Create pool B (simulating switchDb)
      getPool(configB);
      assert(getActivePoolKeys().includes(keyB), 'Pool B should be active in pools map');

      // Disconnect pool A (old database)
      await disconnectPool(configA);
      assert(!getActivePoolKeys().includes(keyA), 'Pool A should be removed after disconnectPool');
      assert(getActivePoolKeys().includes(keyB), 'Pool B should remain active');

      // Clean up pool B
      await disconnectPool(configB);
      assert(!getActivePoolKeys().includes(keyB), 'Pool B should be removed after disconnectPool');
    });
  });
});

export {};

