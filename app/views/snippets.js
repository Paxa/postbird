var electronRemote = require('electron').remote;
var BrowserWindow = electronRemote.BrowserWindow;

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
      }
    });

    newWindow.loadURL('file://' + App.root + '/views/snippets_window.html');

    newWindow.setTitle("Snippets");

    if (process.env.NW_DEBUG == "true") {
      newWindow.webContents.toggleDevTools();
    }

    newWindow.on('closed', () => {
      App.snippersWin = null;
    });

    App.snippersWin = newWindow;
  }
}

global.SnippetsWindow = SnippetsWindow;