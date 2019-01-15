var remote = require('electron').remote;
var Menu = remote.Menu;
var MenuItem = remote.MenuItem;
var webFrame = require('electron').webFrame;

var UpdatesController = require('./controllers/updates_controller');
var ExportController = require('./controllers/export_controller');
var ImportController = require('./controllers/import_controller');

var template = [
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
      /*
      {
        label: 'Toggle Full Screen',
        accelerator: (() => {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      */
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
          global.HistoryWindow.init();
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
          if (focusedWindow && focusedWindow.getURL().match(/index\.html$/) && global.App.tabs.length > 1) {
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
      }
    ]
  },
];

if (process.platform == 'darwin') {
  var name = "Postbird";
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: "Check For Updates...",
        click: () => {
          (new global.UpdatesController).checkUpdates({showLoading: true, showAlreadyLatest: true});
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
        label: 'Hide ' + name,
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
  template[5].submenu.push(
    { type: 'separator' },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

if (process.platform == 'linux') {
  template[6].submenu.unshift(
    {
      label: 'About Postbird',
      click: () => {
        var help = global.HelpScreen.open();
        help.activatePage("about-postbird");
      }
    }
  )
  template[6].submenu.push(
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
}


var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function enableItem(topLabel, itemLable, enabled) {
  if (enabled === undefined) {
    enabled = true;
  }
  menu.items.forEach((item, i) => {
    if (item.label == topLabel) {
      item.submenu.items.forEach((subItem) => {
        if (subItem.label == itemLable) {
          subItem.enabled = enabled;
        }
      });
    }
  });
}

function disableItem(topLabel, itemLable) {
  enableItem(topLabel, itemLable, false);
}


var checkDbMenu = function () {
  var db = global.App.currentTab.instance.database;
  if (db) {
    enableItem("Database", "Create Database");
    enableItem("Database", "Refresh Database");
    enableItem("Database", "Rename Database");
    enableItem("Database", "Export Database");
    enableItem("Database", "Drop Database");
  } else {
    disableItem("Database", "Create Database");
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

App.on('database.changed', (db) => {
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
