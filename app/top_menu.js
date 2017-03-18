var remote = require('electron').remote;
var Menu = remote.Menu;
var MenuItem = remote.MenuItem;
var webFrame = require('electron').webFrame;

var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Import .sql file',
        click: () => {
          (new global.ImportController).doImport();
        },
        accelerator: 'Shift+CmdOrCtrl+i',
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
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'Database',
    submenu: [
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
          (new global.ExportController).doExport();
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
            appTab.view.contents.reloadData();
          } else if (tab == "query") {
            appTab.view.query.runQuery();
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
          if (focusedWindow)
            focusedWindow.reload();
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
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
      {
        label: 'Zoom In',
        click: () => {
          webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.3);
        },
        accelerator: 'CmdOrCtrl+='
      },
      {
        label: 'Zoom Out',
        click: () => {
          webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.3);
        },
        accelerator: 'CmdOrCtrl+-'
      },
      {
        label: 'Zoom to Normal',
        click: () => {
          webFrame.setZoomFactor(1);
        },
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
        label: "Postbird help",
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
    enableItem("Database", "Drop Database");
    enableItem("Database", "Refresh Database");
    enableItem("Database", "Rename Database");
    enableItem("Database", "Export Database");
  } else {
    disableItem("Database", "Drop Database");
    disableItem("Database", "Refresh Database");
    disableItem("Database", "Rename Database");
    disableItem("Database", "Export Database");
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
  checkTableMenu(schema, table);
});

// change tab in window, such as table strunture, content, table info
App.on('dbtab.changed', (tab) => {
  checkTableMenu();
});

