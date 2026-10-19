class MockWindow {
  constructor() {
    this._listeners = {};
    this.webContents = {
      openDevTools: () => {},
      on: () => {},
    };
  }
  on(event, fn) {
    (this._listeners[event] = this._listeners[event] || []).push(fn);
    return this;
  }
  removeListener(event, fn) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    }
    return this;
  }
  emit(event, ...args) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(fn => {
        try { fn(...args); } catch (e) { console.error(e); }
      });
    }
  }
  isFocused() { return true; }
  focus() {}
  blur() {}
  send(event, ...args) { this.emit(event, ...args); }
  loadURL() {}
}

const mainWindowInstance = new MockWindow();

const _hasWindow = typeof window !== "undefined";
const _startTime = _hasWindow ? (window.__appStartTime = window.__appStartTime || Date.now()) : Date.now();
const _isDark = _hasWindow && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const remote = {
  app: {
    getAppPath: () => ".",
    ApplicationStart: _startTime,
    MainFilename: "index.html",
    mainWindow: mainWindowInstance,
  },
  nativeTheme: {
    shouldUseDarkColors: !!_isDark,
  },
  systemPreferences: {
    subscribeNotification: () => {},
    setAppLevelAppearance: () => {},
    isDarkMode: () => false,
  },
  dialog: {
    showOpenDialog: (opts, cb) => cb && cb([]),
    showSaveDialog: (opts, cb) => cb && cb(null),
    showMessageBox: (opts, cb) => cb && cb(0),
    showErrorBox: (title, content) => alert(title + "\n" + content),
  },
  initialize: () => {},
  enable: () => {},
  process: {
    type: "renderer",
    argv: ["electrobun", "postbird"],
    platform: "darwin",
    env: {
      USER: "pavel",
    },
    on: () => {},
    removeListener: () => {},
    emit: () => {},
    cwd: () => ".",
    nextTick: (fn) => queueMicrotask(fn),
    stdout: {
      write: (s) => console.log(s),
    },
    stderr: {
      write: (s) => console.error(s),
    },
  },
  BrowserWindow: MockWindow,
  Menu: class Menu {
    constructor(items = []) {
      this.items = items;
    }
    static buildFromTemplate(template = []) {
      const items = (template || []).map(item => {
        const subItems = item.submenu ? (Array.isArray(item.submenu) ? item.submenu : (item.submenu.items || [])) : [];
        return {
          label: item.label,
          role: item.role,
          enabled: item.enabled !== false,
          submenu: {
            items: subItems.map(sub => ({
              label: sub.label,
              role: sub.role,
              enabled: sub.enabled !== false,
              click: sub.click,
            })),
          },
          click: item.click,
        };
      });
      return new Menu(items);
    }
    static setApplicationMenu() {}
    popup() {}
  },
  MenuItem: class MenuItem {
    constructor(opts) { Object.assign(this, opts); }
  },
  shell: {
    openExternal: (url) => window.open(url, '_blank'),
  },
  clipboard: {
    writeText: (text) => navigator.clipboard && navigator.clipboard.writeText(text),
    readText: () => "",
  },
};

module.exports = remote;
