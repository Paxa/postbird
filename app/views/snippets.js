var electronRemote = require('@electron/remote');
const { BrowserWindow } = require('@electron/remote')

class SnippetsWindow {
  constructor () {
    if (App.snippersWin) {
      App.snippersWin.focus();
      return;
    }

    var newWindow = new BrowserWindow({
      width: 775,
      height: 420,
      title: "Snippets",
      show: true,
      webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      }
    });

    electronRemote.require('@electron/remote/main').enable(newWindow.webContents);
    newWindow.loadURL('file://' + App.root + '/views/snippets_window.html');

    newWindow.setTitle("Snippets");

    if (process.env.POSTBIRD_DEBUG == "true") {
      newWindow.webContents.toggleDevTools();
    }

    newWindow.on('closed', () => {
      App.snippersWin = null;
    });

    App.snippersWin = newWindow;
  }
}

global.SnippetsWindow = SnippetsWindow;