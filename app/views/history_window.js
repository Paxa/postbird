var electronRemote = require('electron').remote;
var BrowserWindow = electronRemote.BrowserWindow;

class HistoryWindow {
  constructor () {

    if (App.historyWin) {
      App.historyWin.focus();
      return;
    }

    var newWindow = new BrowserWindow({
      width: 775,
      height: 420,
      title: "Console",
      show: true,
      webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
      }
    });

    newWindow.loadURL('file://' + App.root + '/views/history_window.html');

    if (process.env.NW_DEBUG == "true") {
      newWindow.webContents.toggleDevTools();
    }

    var evenEmitter = function (event) {
      if (newWindow) {
        newWindow.webContents.send('App.logEvents.add', event);
      }
    };

    newWindow.webContents.on('did-finish-load', () => {
      newWindow.webContents.send('App.logEvents', App.logEvents);
      App.on("log.message", evenEmitter);
    });

    newWindow.on('closed', () => {
      newWindow = null;
      App.historyWin = null;
      App.removeListener("log.message", evenEmitter);
    });

    App.historyWin = newWindow;
  }
}

global.HistoryWindow = HistoryWindow;
