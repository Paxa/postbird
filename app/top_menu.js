var nativeMenuBar = new gui.Menu({type: "menubar"});

if (process.platform == "darwin") {
  nativeMenuBar.createMacBuiltin && nativeMenuBar.createMacBuiltin("Postbird");
}

var menu = {
  '': {
    "Check For Updates...": {
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
    }
  },
  'Edit': { },
  /*
  'Connection': {
    
  },
  */
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
    Reload: function () {
      gui.Window.get().reloadDev();
    },
    Help: {
      click: function() {
        var help = global.HelpScreen.open();
        help.activatePage("get-postgres");
      }
    }
  }
};

AppMenu.extend(nativeMenuBar, menu);

gui.Window.get().menu = nativeMenuBar;

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
