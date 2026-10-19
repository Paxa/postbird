const remote = require('./remote');

const electron = {
  remote,
  app: remote.app,
  BrowserWindow: remote.BrowserWindow,
  Menu: remote.Menu,
  MenuItem: remote.MenuItem,
  dialog: remote.dialog,
  shell: remote.shell,
  clipboard: remote.clipboard,
  nativeTheme: remote.nativeTheme,
  systemPreferences: {
    subscribeNotification: () => {},
    setAppLevelAppearance: () => {},
  },
  ipcRenderer: {
    on: () => {},
    send: () => {},
    removeListener: () => {},
  },
};

module.exports = electron;
