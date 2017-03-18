var electron = require('electron');
var BrowserWindow = electron.remote.BrowserWindow;

global.SnippetsWindow = {
  init: function () {
    if (App.snippersWin) {
      App.snippersWin.focus();
      return;
    }

    newWindow = new BrowserWindow({
      width: 775,
      height: 420,
      title: "Snippets",
      show: true,
      webPreferences: {
        webSecurity: false,
        allowDisplayingInsecureContent: true,
        allowRunningInsecureContent: true
      }
    });

    newWindow.loadURL('file://' + App.root + '/views/snippets_window.html');

    newWindow.setTitle("Snippets");

    if (process.env.NW_DEV == "true") {
      newWindow.webContents.toggleDevTools();
    }

    newWindow.on('closed', () => {
      App.snippersWin = null;
    });

    App.snippersWin = newWindow;
  },

};
