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
    static setApplicationMenu() {}
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
