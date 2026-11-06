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
    get shouldUseDarkColors() {
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    },
  },
  systemPreferences: {
    subscribeNotification: (name, cb) => {
      if (typeof window !== "undefined" && window.matchMedia && typeof cb === "function") {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', () => {
          try { cb(); } catch (e) { console.error(e); }
        });
      }
    },
    setAppLevelAppearance: () => {},
    isDarkMode: () => {
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    },
  },
  dialog: {
    showOpenDialog: async (arg1, arg2, arg3) => {
      let options = {};
      let cb = null;
      if (arg1 && (arg1.properties || arg1.filters || arg1.defaultPath || arg1.title)) {
        options = arg1;
        cb = typeof arg2 === "function" ? arg2 : null;
      } else if (arg2 && typeof arg2 === "object") {
        options = arg2;
        cb = typeof arg3 === "function" ? arg3 : null;
      } else {
        cb = typeof arg2 === "function" ? arg2 : (typeof arg3 === "function" ? arg3 : null);
      }

      if (typeof window !== "undefined" && window.__postbirdRpc && window.__postbirdRpc.openFileDialog) {
        let allowedFileTypes = "*";
        if (Array.isArray(options.filters) && options.filters.length > 0) {
          const exts = [];
          for (const f of options.filters) {
            if (Array.isArray(f.extensions)) {
              for (const ext of f.extensions) {
                const cleanExt = String(ext).replace(/^\./, "");
                if (cleanExt && cleanExt !== "*" && !exts.includes(cleanExt)) {
                  exts.push(cleanExt);
                }
              }
            }
          }
          if (exts.length > 0) {
            allowedFileTypes = exts.join(",");
          }
        }
        const props = Array.isArray(options.properties) ? options.properties : ["openFile"];
        const canChooseFiles = props.includes("openFile") || !props.includes("openDirectory");
        const canChooseDirectory = props.includes("openDirectory");
        const allowsMultipleSelection = props.includes("multiSelections");

        try {
          const res = await window.__postbirdRpc.openFileDialog({
            startingFolder: options.defaultPath,
            allowedFileTypes,
            canChooseFiles,
            canChooseDirectory,
            allowsMultipleSelection,
          });
          const filePaths = Array.isArray(res && res.filePaths) ? res.filePaths.filter(Boolean) : [];
          if (cb) cb(filePaths);
          return { canceled: filePaths.length === 0, filePaths };
        } catch (err) {
          console.error("[Dialog showOpenDialog Error]", err);
        }
      }

      if (cb) cb([]);
      return { canceled: true, filePaths: [] };
    },
    showSaveDialog: async (arg1, arg2, arg3) => {
      let options = {};
      let cb = null;
      if (arg1 && (arg1.defaultPath || arg1.title || arg1.message || arg1.filters)) {
        options = arg1;
        cb = typeof arg2 === "function" ? arg2 : null;
      } else if (arg2 && typeof arg2 === "object") {
        options = arg2;
        cb = typeof arg3 === "function" ? arg3 : null;
      } else {
        cb = typeof arg2 === "function" ? arg2 : (typeof arg3 === "function" ? arg3 : null);
      }

      if (typeof window !== "undefined" && window.__postbirdRpc && window.__postbirdRpc.saveFileDialog) {
        try {
          const res = await window.__postbirdRpc.saveFileDialog({
            title: options.title,
            message: options.message,
            defaultPath: options.defaultPath,
          });
          const filePath = (res && res.filePath) || null;
          if (cb) cb(filePath);
          return { canceled: !filePath, filePath };
        } catch (err) {
          console.error("[Dialog showSaveDialog Error]", err);
        }
      }

      if (cb) cb(null);
      return { canceled: true, filePath: null };
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

      const formatMacOSAlertHtml = (title, detail) => {
        const t = (title || "").replace(/\n/g, "<br>");
        const d = (detail || "").replace(/\n/g, "<br>");
        if (t && d) {
          return `<div class="macos-alert-title">${t}</div><div class="macos-alert-detail">${d}</div>`;
        }
        return `<div class="macos-alert-title">${t || d}</div>`;
      };

      return new Promise((resolve) => {
        const isConfirm = Array.isArray(options.buttons) && options.buttons.length > 1;
        const alertify = (typeof window !== "undefined" && window.alertify) || (typeof globalThis !== "undefined" && globalThis.alertify);

        const finish = (responseIndex) => {
          if (callback) callback(responseIndex);
          resolve({ response: responseIndex, checkboxChecked: false });
        };

        if (alertify) {
          const htmlMsg = formatMacOSAlertHtml(options.message, options.detail);
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
            alertify.labels.ok = originalOk;
            alertify.labels.cancel = originalCancel;
          } else {
            const originalOk = alertify.labels.ok;
            if (options.buttons && options.buttons[0]) alertify.labels.ok = options.buttons[0];

            alertify.alert(htmlMsg, () => {
              alertify.labels.ok = originalOk;
              finish(0);
            });
            alertify.labels.ok = originalOk;
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
        const htmlMsg = `<div class="macos-alert-title">${(title || "").replace(/\n/g, "<br>")}</div><div class="macos-alert-detail">${(content || "").replace(/\n/g, "<br>")}</div>`;
        alertify.alert(htmlMsg);
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

      const isDark = Boolean(
        (typeof document !== 'undefined' && document.body && document.body.classList.contains('dark-mode')) ||
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );

      const menuEl = document.createElement('div');
      menuEl.id = 'postbird-context-menu-popup';
      menuEl.style.position = 'fixed';
      menuEl.style.left = `${x}px`;
      menuEl.style.top = `${y}px`;
      menuEl.style.zIndex = '999999';
      menuEl.style.minWidth = '160px';
      menuEl.style.backgroundColor = isDark ? 'rgba(44, 44, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)';
      menuEl.style.color = isDark ? '#f2f2f7' : '#1c1c1e';
      menuEl.style.border = isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.15)';
      menuEl.style.borderRadius = '8px';
      menuEl.style.boxShadow = isDark ? '0 10px 30px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.15)';
      menuEl.style.padding = '4px 0';
      menuEl.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      menuEl.style.fontSize = '13px';
      menuEl.style.userSelect = 'none';
      menuEl.style.backdropFilter = 'blur(20px)';
      menuEl.style.webkitBackdropFilter = 'blur(20px)';

      for (const item of this.items) {
        if (item.type === 'separator') {
          const sep = document.createElement('div');
          sep.style.height = '1px';
          sep.style.margin = '4px 0';
          sep.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';
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
            itemEl.style.color = isDark ? '#f2f2f7' : '#1c1c1e';
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
    openExternal: (url) => {
      if (typeof window !== "undefined" && window.__postbirdRpc && window.__postbirdRpc.openExternal) {
        return window.__postbirdRpc.openExternal({ url });
      }
      return typeof window !== "undefined" && window.open ? window.open(url, "_blank") : null;
    },
  },
  clipboard: {
    writeText: (text) => navigator.clipboard && navigator.clipboard.writeText(text),
    readText: () => "",
  },
};

module.exports = remote;
