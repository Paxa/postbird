var electron = require('electron');
var BrowserWindow = electron.remote.BrowserWindow;

global.HistoryWindow = {
  init: function () {

    if (App.historyWin) {
      App.historyWin.focus();
      return;
    }

    newWindow = new BrowserWindow({
      width: 775,
      height: 420,
      title: "Console",
      show: true,
      webPreferences: {
        webSecurity: false,
        allowDisplayingInsecureContent: true,
        allowRunningInsecureContent: true
      }
    });

    newWindow.loadURL('file://' + App.root + '/views/history_window.html');

    if (process.env.NW_DEV == "true") {
      newWindow.webContents.toggleDevTools();
    }

    newWindow.webContents.on('did-finish-load', function () {
      newWindow.webContents.send('App.logEvents', App.logEvents);
      App.on("log.message", function (event) {
        if (newWindow) {
          newWindow.webContents.send('App.logEvents.add', event);
        }
      });
    });

    newWindow.on('closed', function(event) {
      newWindow = null;
      App.historyWin = null;
    });

    App.historyWin = newWindow;
  }
};
