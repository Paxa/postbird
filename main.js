const electron = require('electron');
const app = electron.app;
const path = require('path');
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');

require('@electron/remote/main').initialize();

// Enable remote for all new web contents
app.on('web-contents-created', (event, contents) => {
  require('@electron/remote/main').enable(contents);
});

electron.app.ApplicationStart = Date.now();
electron.app.MainFilename = process.mainModule.filename;

require('./lib/error_reporter').init();

// Report crashes to our server.
//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var filesToOpen = [];
var urlsToOpen = [];

if (electron.systemPreferences && electron.systemPreferences.subscribeNotification) {
  var checkDarkMode = () => {
    if (electron.nativeTheme.shouldUseDarkColors) {
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

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('postgres', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('postgres')
}

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
    mainWindow.focus();
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
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  mainWindowState.manage(mainWindow);

  electron.app.mainWindow = mainWindow;

  // Enable @electron/remote for this webContents
  require("@electron/remote/main").enable(mainWindow.webContents);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  if (process.env.POSTBIRD_DEBUG == "true") {
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
