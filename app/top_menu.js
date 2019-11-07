var remote = require('electron').remote;
var Menu = remote.Menu;

// @ts-ignore
var template /*: Electron.MenuItemConstructorOptions[] */ = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Import .sql file',
        click: () => {
          (new ImportController).doImport();
        },
        accelerator: 'CmdOrCtrl+o',
      },
      {
        label: 'Reconnect',
        click: () => {
          if (global.App.currentTab.instance.connection) {
            global.App.currentTab.instance.reconnect();
          } else {
            window.alertify.alert('Current tab not connected');
          }
        }
      },
      {
        label: 'New Connection',
        click: () => {
          global.App.activateLoginTab();
        },
        accelerator: 'CmdOrCtrl+t'
      }
    ]
  },
  {
    label: 'Edit',
    role: 'editMenu'
  },
  {
    label: 'Database',
    submenu: [
      {
        label: 'Create Database',
        click: () => {
          new Dialog.NewDatabase(global.App.currentTab.instance);
        },
        enabled: false
      },
      {
        label: 'Refresh Database',
        click: () => {
          global.App.currentTab.instance.fetchTablesAndSchemas();
          global.App.currentTab.instance.fetchDbList();
        },
        enabled: false
      },
      {
        label: 'Refresh Databases List',
        click: () => {
          global.App.currentTab.instance.fetchDbList();
        },
        enabled: false
      },
      {
        label: 'Rename Database',
        click: () => {
          global.App.currentTab.instance.renameDatabaseDialog();
        },
        enabled: false
      },
      {
        label: 'Export Database',
        click: () => {
          (new ExportController).doExport();
        },
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Drop Database',
        click: () => {
          global.App.currentTab.instance.dropDatabaseDialog();
        },
        enabled: false
      }
    ]
  },
  {
    label: 'Table',
    submenu: [
      {
        label: 'Reload',
        click: () => {
          var appTab = global.App.currentTab.instance;
          var tab = appTab.currentTab;

          if (tab == "content") {
            appTab.view.contentPane.reloadData();
          } else if (tab == "query") {
            appTab.view.queryPane.runQuery();
          } else {
            appTab.activateTab(tab, 'force');
          }
        },
        accelerator: 'CmdOrCtrl+r',
        enabled: false
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'Shift+CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            remote.app.ApplicationStart = Date.now();
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (() => {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        role: 'toggledevtools'
      },
      {
        label: 'Zoom In',
        role: 'zoomin',
        accelerator: 'CmdOrCtrl+='
      },
      {
        label: 'Zoom Out',
        role: 'zoomout',
        accelerator: 'CmdOrCtrl+-'
      },
      {
        label: 'Zoom to Normal',
        role: 'resetzoom',
        accelerator: 'CmdOrCtrl+0'
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Console',
        click: () => {
          new HistoryWindow();
        },
        accelerator: 'CmdOrCtrl+l'
      },
      { type: 'separator' },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close Tab',
        accelerator: 'CmdOrCtrl+W',
        click: (item, focusedWindow) => {
          if (focusedWindow && focusedWindow.webContents.getURL().match(/index\.html$/) && global.App.tabs.length > 1) {
            global.App.closeCurrentTab();
          } else {
            if (focusedWindow) {
              focusedWindow.close();
            } else {
              //remote.app.quit();
            }
          }
        }
      },
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: "Postbird Help",
        accelerator: 'CmdOrCtrl+Shift+/',
        click: () => {
          var help = global.HelpScreen.open();
          help.activatePage("get-postgres");
        }
      },
      {
        label: "Send Feedback",
        click: () => {
          remote.shell.openExternal("https://github.com/Paxa/postbird/issues");
        }
      }
    ]
  },
];


if (process.platform == 'darwin') {
  var selfName = "Postbird";
  // @ts-ignore
  template.unshift({
    label: selfName,
    submenu: [
      {
        label: 'About ' + selfName,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: "Check For Updates...",
        click: () => {
          (new UpdatesController).checkUpdates({showLoading: true, showAlreadyLatest: true});
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + selfName,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => { remote.app.quit(); }
      },
    ]
  });
  // Window menu.
  var windowMenuSubmenu = /*:: <Electron.MenuItemConstructorOptions[]><any> */ template[5].submenu;
  windowMenuSubmenu.push(
    { type: 'separator' },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

if (process.platform == 'linux') {
  var helpMenuSubmenu = /*:: <Electron.MenuItemConstructorOptions[]><any> */ template[6].submenu;
  helpMenuSubmenu.unshift(
    {
      label: 'About Postbird',
      click: () => {
        var help = global.HelpScreen.open();
        help.activatePage("about-postbird");
      }
    }
  )
  helpMenuSubmenu.push(
    {
      type: 'separator'
    },
    {
      label: "Check For Updates...",
      click: () => {
        (new global.UpdatesController).checkUpdates({showLoading: true, showAlreadyLatest: true});
      }
    },
  );
  var appMenuSubmenu = /*:: <Electron.MenuItemConstructorOptions[]><any> */ template[0].submenu;
  appMenuSubmenu.push(
    {
      type: 'separator'
    },
    {
      label: "Quit",
      click: () => { remote.app.quit(); }
    },
  );
}


var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function enableItem(topLabel, itemLable, enabled = true) {
  for (let item of menu.items) {
    if (item.label == topLabel) {
      // @ts-ignore
      for (let subItem of item.submenu.items) {
        if (subItem.label == itemLable) {
          subItem.enabled = enabled;
          return;
        }
      }
    }
  }
}

function disableItem(topLabel, itemLable) {
  enableItem(topLabel, itemLable, false);
}


var checkDbMenu = function () {
  var db = global.App.currentTab.instance.database;
  var connected = !!db;

  if (connected) {
    enableItem("Database", "Create Database");
    enableItem("Database", "Refresh Databases List");
  } else {
    disableItem("Database", "Create Database");
    disableItem("Database", "Refresh Databases List");
  }

  if (db && db != Connection.defaultDatabaseName) {
    enableItem("Database", "Refresh Database");
    enableItem("Database", "Rename Database");
    enableItem("Database", "Export Database");
    enableItem("Database", "Drop Database");
  } else {
    disableItem("Database", "Refresh Database");
    disableItem("Database", "Rename Database");
    disableItem("Database", "Export Database");
    disableItem("Database", "Drop Database");
  }
};

var checkTableMenu = function () {
  var table = global.App.currentTab.instance.currentTable;
  var tab = global.App.currentTab.instance.currentTab;
  //var schema = global.App.currentTab.instance.currentSchema;

  if (tab == "query" || table && ["content", "structure", "info"].indexOf(tab) != -1) {
    enableItem("Table", "Reload");
  } else {
    disableItem("Table", "Reload");
  }
};

global.App.on('database.changed', (db) => {
  checkDbMenu();
  checkTableMenu();
});

App.on('tab.changed', (tabId) => {
  checkDbMenu();
  checkTableMenu();
});

App.on('table.changed', (schema, table) => {
  checkTableMenu();
});

// change tab in window, such as table strunture, content, table info
App.on('dbtab.changed', (tab) => {
  checkTableMenu();
});
