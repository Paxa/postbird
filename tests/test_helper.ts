try {
  const bunTest = require("bun:test");
  bunTest.mock.module("@electron/remote", () => require("../electrobun/shims/remote"));
  bunTest.mock.module("electron", () => require("../electrobun/shims/electron"));
  bunTest.mock.module("is-electron-renderer", () => () => true);
  bunTest.mock.module("pg", () => require("../lib/sql_client"));
  global.before = bunTest.beforeAll;
  global.after = bunTest.afterAll;
} catch (e) {}

try {
  const { GlobalWindow } = require("happy-dom");
  const happyWin = new GlobalWindow();
  global.window = happyWin as any;
  global.document = happyWin.document as any;
  global.HTMLElement = happyWin.HTMLElement as any;
  global.HTMLFormElement = happyWin.HTMLFormElement as any;
  global.HTMLInputElement = happyWin.HTMLInputElement as any;
  global.HTMLSelectElement = happyWin.HTMLSelectElement as any;
  global.HTMLOptionElement = happyWin.HTMLOptionElement as any;
  global.Event = happyWin.Event as any;
  global.CustomEvent = happyWin.CustomEvent as any;
} catch (e) {
  global.window = global.window || ({} as any);
}
if (!window.localStorage) {
  const store = new Map<string, string>();
  const storageObj: any = {
    getItem: (key: string) => (store.has(String(key)) ? store.get(String(key))! : null),
    setItem: (key: string, val: any) => { store.set(String(key), String(val)); },
    removeItem: (key: string) => { store.delete(String(key)); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  };
  window.localStorage = new Proxy(storageObj, {
    get(target, prop: string) {
      if (prop in target) return target[prop];
      return store.get(prop);
    },
    set(target, prop: string, value: any) {
      if (prop in target) {
        target[prop] = value;
      } else {
        store.set(prop, String(value));
      }
      return true;
    },
    deleteProperty(target, prop: string) {
      return store.delete(prop);
    }
  });
}

if (!(global as any).$u) {
  const createMockChain = (selector?: any): any => {
    const classes = new Set<string>();
    let textVal = '';
    const obj: any = {
      length: 1,
      selector,
      rawHtml: typeof selector === 'string' ? selector : '',
      children: [] as any[],
      append: (child: any) => {
        if (typeof child === 'string') {
          obj.rawHtml += child;
        } else if (child) {
          obj.children.push(child);
        }
        return obj;
      },
      empty: () => { obj.rawHtml = ''; obj.children = []; return obj; },
      html: (val?: string) => {
        if (val !== undefined) {
          obj.rawHtml = val;
          obj.children = [];
          return obj;
        }
        let out = obj.rawHtml || (typeof selector === 'string' ? selector : '');
        for (const ch of obj.children) {
          out += typeof ch === 'string' ? ch : (ch.html ? ch.html() : (ch.rawHtml || ''));
        }
        return out;
      },
      _findCache: {} as Record<string, any>,
      find: (subSel: string) => {
        if (!obj._findCache) obj._findCache = {};
        if (obj._findCache[subSel]) return obj._findCache[subSel];
        const sub = createMockChain(subSel);
        sub.parentObj = obj;
        const origAppend = sub.append;
        sub.append = (child: any) => {
          origAppend(child);
          const childContent = typeof child === 'string' ? child : (child && child.html ? child.html() : (child && child.rawHtml ? child.rawHtml : ''));
          sub.rawHtml += childContent;
          if (obj) obj.rawHtml += childContent;
          return sub;
        };
        const origHtml = sub.html;
        sub.html = (val?: string) => {
          if (val !== undefined) {
            origHtml(val);
            obj.rawHtml += val;
            return sub;
          }
          return origHtml();
        };
        const origText = sub.text;
        sub.text = (val?: string) => {
          if (val !== undefined) {
            origText(val);
            obj.rawHtml += ' ' + val;
            return sub;
          }
          return origText();
        };
        obj._findCache[subSel] = sub;
        return sub;
      },
      prop: (propName: string, val?: any) => {
        if (val !== undefined) return obj;
        return true;
      },
      addClass: (cls: string) => { classes.add(cls); return obj; },
      removeClass: (cls: string) => { classes.delete(cls); return obj; },
      toggleClass: (cls: string, state?: boolean) => {
        if (state === false) classes.delete(cls);
        else if (state === true) classes.add(cls);
        else if (classes.has(cls)) classes.delete(cls);
        else classes.add(cls);
        return obj;
      },
      val: () => "",
      hasClass: (cls: string) => classes.has(cls),
      hide: () => obj,
      show: () => obj,
      off: () => obj,
      on: () => obj,
      bind: () => obj,
      unbind: () => obj,
      attr: () => obj,
      text: (val?: string) => {
        if (val !== undefined) {
          textVal = val;
          obj.rawHtml = (obj.rawHtml || '').includes('>') ? (obj.rawHtml || '').replace(/>$/, `>${val}`) : val;
          return obj;
        }
        return textVal || obj.rawHtml;
      },
      forEach: (cb: any) => {},
      each: (cb: any) => {},
      replaceWith: () => obj,
      remove: () => { obj.rawHtml = ''; return obj; },
      cloneNode: () => obj,
      scrollTop: 0,
      scrollHeight: 100,
      offset: () => ({ top: 0, left: 0 }),
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
  mockJQuery.contextMenu = (el: any, actions: any) => {};
  (global as any).$u = window.$u = mockJQuery;
}


require('../app');
require('../app/connection');

global.assert = require('./assert_extras');

(global as any).Model = require('../app/models/all');

global.cleanupSchema = async (connection) => {
  if (!connection) {
    connection = Connection.instances[0];
  }
  return connection.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

global.testConnection = async (logging) => {
  var existingConn = getConnection();
  if (existingConn) {
    if (existingConn.hasRunningQuery()) {
      existingConn.stopRunningQuery();
    }
    await cleanupSchema();
    return existingConn;
  }

  var connection = new Connection();
  await connection.connectToServer({
    user: process.env.PG_USER || process.env.USER || process.env.USERNAME,
    password: process.env.PG_PASSWORD || '',
    port: process.env.PG_PORT,
    database: 'postbird_test'
  });

  if (!logging) {
    connection.logging = false;
  }

  /*
  try {
    await connection.server.createDatabase('postbird_test');
  } catch (err) {
    if (err.message != 'database "postbird_test" already exists') {
      throw err;
    }
  }

  await connection.switchDb('postbird_test');
  */
  await cleanupSchema();

  ModelBase.defaultConnection = connection;
  App.tabs = [{ instance: { connection: connection} }];
  App.activeTab = 0;

  return connection;
}

global.TestHelper = {
  publicTables: async () => {
    var result = await Connection.instances[0].query("SELECT * FROM information_schema.tables where table_schema = 'public' ORDER BY table_name;");

    return result.rows.map(row => {
      return '' + row.table_name
    });
  }
};

global.getConnection = () => {
  return Connection.instances[0];
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

