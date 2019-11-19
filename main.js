const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');

electron.app.ApplicationStart = Date.now();

// Report crashes to our server.
//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var filesToOpen = [];
var urlsToOpen = [];

if (electron.systemPreferences && electron.systemPreferences.subscribeNotification) {
  var checkDarkMode = () => {
    if (electron.systemPreferences.isDarkMode()) {
      electron.systemPreferences.setAppLevelAppearance('dark');
    } else {
      electron.systemPreferences.setAppLevelAppearance('light');
    }
  }

  electron.systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', checkDarkMode);
  checkDarkMode();
}

app.on('window-all-closed', function() {
  //if (process.platform != 'darwin') {
    app.quit();
  //}
});

app.setAsDefaultProtocolClient('postgres');

app.on('open-file', (event, filename) => {
  event.preventDefault();

  if (mainWindow) {
    mainWindow.send('open-file', filename);
  } else {
    filesToOpen.push(filename);
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();

  if (mainWindow) {
    mainWindow.send('open-url', url);
  } else {
    urlsToOpen.push(url);
  }
});

app.on('ready', () => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 960,
    defaultHeight: 640
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: true
    },
  });

  mainWindowState.manage(mainWindow);

  electron.app.mainWindow = mainWindow;

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  if (process.env.NW_DEBUG == "true") {
    mainWindow.webContents.openDevTools({detach: true});
  }

  // when main window is ready - send all pending events
  electron.ipcMain.on('main-window-ready', () => {
    filesToOpen.forEach((file) => {
      mainWindow.send('open-file', file);
    });

    urlsToOpen.forEach((url) => {
      mainWindow.send('open-url', url);
    });

    //electron.autoUpdater.setFeedURL("http://localhost:5000/update/osx/0.4");
    //electron.autoUpdater.checkForUpdates();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
