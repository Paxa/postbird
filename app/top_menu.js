const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
var webFrame = require('electron').webFrame;

var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Import .sql file',
        click: function () {
          (new global.ImportController).doImport();
        },
        accelerator: 'Shift+CmdOrCtrl+i',
      },
      {
        label: 'Reconnect',
        click: function () {
          if (global.App.currentTab.instance.connection) {
            global.App.currentTab.instance.reconnect();
          } else {
            window.alertify.alert('Current tab not connected');
          }
        }
      },
      {
        label: 'New Connection',
        click: function () {
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
        click: function () {
          global.App.currentTab.instance.fetchTablesAndSchemas();
        },
        enabled: false
      },
      {
        label: 'Rename Database',
        click: function () {
          global.App.currentTab.instance.renameDatabaseDialog();
        },
        enabled: false
      },
      {
        label: 'Export Database',
        click: function () {
          (new global.ExportController).doExport();
        },
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Drop Database',
        click: function () {
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
        click: function () {
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
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
      {
        label: 'Zoom in',
        click: function () {
          webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.5);
          //remote.BrowserWindow.zoomFactor += 0.5;
          //gui.Window.get().zoomLevel += 0.5;
        },
        accelerator: 'CmdOrCtrl+Plus'
      },
      {
        label: 'Zoom out',
        click: function () {
          //remote.BrowserWindow.zoomFactor -= 0.5;
          webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.5);
          //gui.Window.get().zoomLevel -= 0.5;
        },
        accelerator: 'CmdOrCtrl+-'
      },
      {
        label: 'Zoom to noraml',
        click: function () {
          //gui.Window.get().zoomLevel = 0;
          //remote.BrowserWindow.zoomFactor = 1;
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
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  /*
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
      },
    ]
  },
  */
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
        click: function () {
          (new global.UpdatesController).checkUpdates();
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
        click: function() { app.quit(); }
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

/*

var nativeMenuBar = new gui.Menu({type: "menubar"});

if (process.platform == "darwin") {
  nativeMenuBar.createMacBuiltin && nativeMenuBar.createMacBuiltin("Postbird");
}

var menu = {
  '': {
    "Check For Updates...": {
      position: 1,
      click: function () {
        (new global.UpdatesController).checkUpdates();
      }
    }
  },
  'File': {
    'Import .sql file': {
      click: function () {
        (new global.ImportController).doImport();
      },
      key: 'i',
      modifiers: 'cmd+shift'
    },
    'Reconnect': {
      click: function () {
        if (global.App.currentTab.instance.connection) {
          global.App.currentTab.instance.reconnect();
        } else {
          window.alertify.alert('Current tab not connected');
        }
      }
    },
    'New Connection': {
      click: function () {
        global.App.activateLoginTab();
      },
      key: 't'
    }
  },
  'Edit': { },
  'Database': {
    'Refresh Database': {
      click: function () {
        global.App.currentTab.instance.fetchTablesAndSchemas();
      },
      enabled: false
    },
    'Rename Database': {
      click: function () {
        global.App.currentTab.instance.renameDatabaseDialog();
      },
      enabled: false
    },
    'Export Database': {
      click: function () {
        (new global.ExportController).doExport();
      },
      enabled: false
    },
    'separator': 'separator',
    'Drop Database': {
      click: function () {
        global.App.currentTab.instance.dropDatabaseDialog();
      },
      enabled: false
    }
  },
  'Table': {
    'Reload': {
      click: function () {
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
      key: 'r',
      enabled: false
    }
  },
  'Window': {
    'Close Window or Tab': {
      click: function () {
        if (global.App.tabs.length > 1) {
          global.App.closeCurrentTab();
        } else {
          gui.Window.get().close();
        }
      },
      key: 'w',
      position: 1
    },
    'separator': 'separator',
    'Zoom in': {
      click: function () {
        gui.Window.get().zoomLevel += 0.5;
      },
      key: '+'
    },
    'Zoom out': {
      click: function () {
        gui.Window.get().zoomLevel -= 0.5;
      },
      key: '-'
    },
    'Zoom to noraml': {
      click: function () {
        gui.Window.get().zoomLevel = 0;
      },
      key: '0'
    },
    'separator2': 'separator',
    'Inspector': {
      click: function () {
        var win = gui.Window.get();
        if (win.isDevToolsOpen()) {
          win.closeDevTools();
        } else {
          win.showDevTools();
        }
      },
      key: 'i'
    },
    Reload: {
      click: function () {
        gui.Window.get().reloadDev();
      },
      key: 'r',
      modifiers: 'cmd+shift'
    },
    Help: {
      click: function() {
        var help = global.HelpScreen.open();
        help.activatePage("get-postgres");
      }
    },
    Console: {
      click: function() {
        global.HistoryWindow.init();
      },
      key: 'l'
    }
  }
};


function Object_forEach (object, callback) {
  for (var key in object) {
    if (object.hasOwnProperty(key)) callback(key, object[key]);
  }
};

var AppMenu = {
  extend: function(nativeMenuBar, newMenu) {
    Object_forEach(newMenu, function (submenuName, submenu) {
      var nativeSubmenu;
      nativeMenuBar.items.forEach(function(es) {
        if (es.label == submenuName) nativeSubmenu = es.submenu;
      });
      if (!nativeSubmenu) {
        nativeSubmenu = new gui.Menu();
        var position = nativeMenuBar.items.length - 1;
        try {
          nativeMenuBar.insert(new gui.MenuItem({label: submenuName, submenu: nativeSubmenu}), position);
        } catch (error) {
          console.log("Error inserting submenu", submenuName);
          console.error(error);
        }
      }
      Object_forEach(submenu, function (itemName, callback) {
        if (typeof callback == 'string') {
          nativeSubmenu.append(new gui.MenuItem({ type: callback }));
        } else {
          var menuItem;
          var itemPosition = undefined;
          if (typeof callback == 'object') {
            var options = {label: itemName};
            Object_forEach(callback, function (key, value) {
              options[key] = value;
            });
            try {
              if (options.position != undefined) {
                itemPosition = options.position;
                delete options.position;
              }
              menuItem = new gui.MenuItem(options);
            } catch (error) {
              console.log("Error creating menu item ", options);
              console.error(error);
            }
          } else {
            menuItem = new gui.MenuItem({label: itemName});
            menuItem.click = callback;
          }
          try {
            if (itemPosition != undefined) {
              nativeSubmenu.insert(menuItem, itemPosition);
            } else {
              nativeSubmenu.append(menuItem);
            }
          } catch (error) {
            console.log("Error appending menu item ", menuItem);
            console.error(error);
          }
        }
      });
    });
  },

  createAndExtend: function (menuObject) {
    var nativeMenuBar = new gui.Menu({type: "menubar"});
    nativeMenuBar.createMacBuiltin && nativeMenuBar.createMacBuiltin("AppMenu");

    AppMenu.extend(nativeMenuBar, menuObject);
    gui.Window.get().menu = nativeMenuBar;
  },

  menuItem: function (menuName, itemName) {
    var menu = gui.Window.get().menu;
    var result;
    menu.items.forEach(function(es) {
      if (es.label == menuName) {
        es.submenu.items.forEach(function(item) {
          if (item.label == itemName) result = item;
        });
      }
    });
    return result;
  },

  removeItem: function (menuName, itemName) {
    var menu = gui.Window.get().menu;
    var result;
    menu.items.forEach(function(es) {
      if (es.label == menuName) {
        es.submenu.items.forEach(function(item) {
          if (item.label == itemName) {
            es.submenu.remove(item);
            result = item;
          }
        });
      }
    });
    return result;
  },

  callMenuItem: function (menuName, itemName) {
    var item = this.menuItem(menuName, itemName);
    if (item) item.click();
  },

  disableItem: function (menuName, itemName) {
    var item = this.menuItem(menuName, itemName);
    if (item) {
      item.enabled = false;
    } else {
      console.log("can not find menu item: '" + menuName + " -> " + itemName);
    }
  },

  enableItem: function (menuName, itemName) {
    var item = this.menuItem(menuName, itemName);
    if (item) {
      item.enabled = true;
    } else {
      console.log("can not find menu item: '" + menuName + " -> " + itemName);
    }
  },
};



AppMenu.extend(nativeMenuBar, menu);

gui.Window.get().menu = nativeMenuBar;

AppMenu.removeItem("Window", "Close Window");

window.Mousetrap.bind("command+shift+/", function () {
  AppMenu.callMenuItem('Window', 'Help');
  return false;
});

var checkDbMenu = function () {
  var db = global.App.currentTab.instance.database;
  if (db) {
    AppMenu.enableItem("Database", "Drop Database");
    AppMenu.enableItem("Database", "Refresh Database");
    AppMenu.enableItem("Database", "Rename Database");
    AppMenu.enableItem("Database", "Export Database");
  } else {
    AppMenu.disableItem("Database", "Drop Database");
    AppMenu.disableItem("Database", "Refresh Database");
    AppMenu.disableItem("Database", "Rename Database");
    AppMenu.disableItem("Database", "Export Database");
  }
};

var checkTableMenu = function () {
  var table = global.App.currentTab.instance.currentTable;
  var tab = global.App.currentTab.instance.currentTab;
  //var schema = global.App.currentTab.instance.currentSchema;

  if (tab == "query" || table && ["content", "structure", "info"].indexOf(tab) != -1) {
    AppMenu.enableItem("Table", "Reload");
  } else {
    AppMenu.disableItem("Table", "Reload");
  }
};

App.on('database.changed', function (db) {
  checkDbMenu();
  checkTableMenu();
});

App.on('tab.changed', function (tabId) {
  checkDbMenu();
  checkTableMenu();
});

App.on('table.changed', function (schema, table) {
  checkTableMenu(schema, table);
});

// change tab in window, such as table strunture, content, table info
App.on('dbtab.changed', function (tab) {
  checkTableMenu();
});

*/