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
  getCurrentWindow: () => mainWindowInstance,
  app: {
    getAppPath: () => ".",
    getVersion: () => "0.9.0",
    getName: () => "Postbird",
    ApplicationStart: _startTime,
    MainFilename: "index.html",
    mainWindow: mainWindowInstance,
    getPath: (name) => {
      if (name === "userData") {
        if (typeof process !== "undefined" && process.platform === "darwin") {
          return "/Users/" + (process.env.USER || "user") + "/Library/Application Support/Postbird";
        }
        return ".";
      }
      return ".";
    },
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
    showOpenDialog: (arg1, arg2, arg3) => {
      const cb = typeof arg2 === "function" ? arg2 : (typeof arg3 === "function" ? arg3 : null);
      if (cb) cb([]);
      return Promise.resolve({ canceled: true, filePaths: [] });
    },
    showSaveDialog: (arg1, arg2, arg3) => {
      const cb = typeof arg2 === "function" ? arg2 : (typeof arg3 === "function" ? arg3 : null);
      if (cb) cb(null);
      return Promise.resolve({ canceled: true, filePath: null });
    },
    showMessageBox: (arg1, arg2, arg3) => {
      let options = {};
      let callback = null;

      if (arg1 && (arg1.message || arg1.buttons || arg1.type || arg1.detail)) {
        options = arg1;
        callback = typeof arg2 === "function" ? arg2 : null;
      } else if (arg2 && (arg2.message || arg2.buttons || arg2.type || arg2.detail)) {
        options = arg2;
        callback = typeof arg3 === "function" ? arg3 : null;
      } else {
        options = arg1 || {};
        callback = typeof arg2 === "function" ? arg2 : null;
      }

      let messageText = options.message || "";
      if (options.detail) {
        messageText = messageText ? `${messageText}\n\n${options.detail}` : options.detail;
      }

      return new Promise((resolve) => {
        const isConfirm = Array.isArray(options.buttons) && options.buttons.length > 1;
        const alertify = (typeof window !== "undefined" && window.alertify) || (typeof globalThis !== "undefined" && globalThis.alertify);

        const finish = (responseIndex) => {
          if (callback) callback(responseIndex);
          resolve({ response: responseIndex, checkboxChecked: false });
        };

        if (alertify) {
          const htmlMsg = messageText.replace(/\n/g, "<br>");
          if (isConfirm) {
            const originalOk = alertify.labels.ok;
            const originalCancel = alertify.labels.cancel;
            if (options.buttons && options.buttons[0]) alertify.labels.ok = options.buttons[0];
            if (options.buttons && options.buttons[1]) alertify.labels.cancel = options.buttons[1];

            alertify.confirm(htmlMsg, (confirmed) => {
              alertify.labels.ok = originalOk;
              alertify.labels.cancel = originalCancel;
              finish(confirmed ? 0 : 1);
            });
          } else {
            const originalOk = alertify.labels.ok;
            if (options.buttons && options.buttons[0]) alertify.labels.ok = options.buttons[0];

            alertify.alert(htmlMsg, () => {
              alertify.labels.ok = originalOk;
              finish(0);
            });
          }
        } else {
          if (isConfirm) {
            const res = typeof globalThis.confirm === "function" ? globalThis.confirm(messageText) : true;
            finish(res ? 0 : 1);
          } else {
            if (typeof globalThis.alert === "function") {
              globalThis.alert(messageText);
            } else {
              console.log("[Dialog Message]", messageText);
            }
            finish(0);
          }
        }
      });
    },
    showErrorBox: (title, content) => {
      const alertify = (typeof window !== "undefined" && window.alertify) || (typeof globalThis !== "undefined" && globalThis.alertify);
      const text = `${title}\n\n${content}`;
      if (alertify) {
        alertify.alert(text.replace(/\n/g, "<br>"));
      } else if (typeof alert === "function") {
        alert(text);
      }
    },
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
    versions: {
      bun: "1.2.0",
      node: "22.0.0",
      electron: "30.0.0",
    },
    on: () => {},
    removeListener: () => {},
    emit: () => {},
    cwd: () => ".",
    nextTick: (fn, ...args) => queueMicrotask(() => (typeof fn === 'function' ? fn(...args) : undefined)),
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
      this.items = Array.isArray(items) ? [...items] : [];
    }
    append(item) {
      this.items.push(item);
    }
    insert(pos, item) {
      this.items.splice(pos, 0, item);
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
    static setApplicationMenu(menu) {
      Menu._applicationMenu = menu;
    }
    static getApplicationMenu() {
      return Menu._applicationMenu;
    }
    popup(options = {}) {
      if (typeof document === 'undefined') return;

      const existing = document.getElementById('postbird-context-menu-popup');
      if (existing) existing.remove();

      const e = this.clickEvent || window.event;
      const x = e ? (e.clientX || e.pageX || 100) : 100;
      const y = e ? (e.clientY || e.pageY || 100) : 100;

      const menuEl = document.createElement('div');
      menuEl.id = 'postbird-context-menu-popup';
      menuEl.style.position = 'fixed';
      menuEl.style.left = `${x}px`;
      menuEl.style.top = `${y}px`;
      menuEl.style.zIndex = '999999';
      menuEl.style.minWidth = '160px';
      menuEl.style.backgroundColor = '#2c2c2e';
      menuEl.style.color = '#f2f2f7';
      menuEl.style.border = '1px solid rgba(255, 255, 255, 0.15)';
      menuEl.style.borderRadius = '8px';
      menuEl.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
      menuEl.style.padding = '4px 0';
      menuEl.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      menuEl.style.fontSize = '13px';
      menuEl.style.userSelect = 'none';

      for (const item of this.items) {
        if (item.type === 'separator') {
          const sep = document.createElement('div');
          sep.style.height = '1px';
          sep.style.margin = '4px 0';
          sep.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          menuEl.appendChild(sep);
          continue;
        }

        const itemEl = document.createElement('div');
        itemEl.textContent = item.label || item.role || '';
        itemEl.style.padding = '5px 14px';
        itemEl.style.cursor = item.enabled === false ? 'default' : 'pointer';
        itemEl.style.opacity = item.enabled === false ? '0.4' : '1';
        itemEl.style.borderRadius = '4px';
        itemEl.style.margin = '0 3px';

        if (item.enabled !== false) {
          itemEl.addEventListener('mouseenter', () => {
            itemEl.style.backgroundColor = '#007aff';
            itemEl.style.color = '#ffffff';
          });
          itemEl.addEventListener('mouseleave', () => {
            itemEl.style.backgroundColor = 'transparent';
            itemEl.style.color = '#f2f2f7';
          });
          itemEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
            menuEl.remove();
            if (item.click) item.click(item, null);
          });
        }
        menuEl.appendChild(itemEl);
      }

      document.body.appendChild(menuEl);

      const rect = menuEl.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuEl.style.left = `${Math.max(10, window.innerWidth - rect.width - 10)}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuEl.style.top = `${Math.max(10, window.innerHeight - rect.height - 10)}px`;
      }

      const closeHandler = (ev) => {
        if (!menuEl.contains(ev.target)) {
          menuEl.remove();
          cleanup();
        }
      };
      const keyHandler = (ev) => {
        if (ev.key === 'Escape') {
          menuEl.remove();
          cleanup();
        }
      };
      const cleanup = () => {
        document.removeEventListener('mousedown', closeHandler);
        document.removeEventListener('keydown', keyHandler);
      };
      setTimeout(() => {
        document.addEventListener('mousedown', closeHandler);
        document.addEventListener('keydown', keyHandler);
      }, 10);
    }
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
