var nativeMenuBar = new gui.Menu({type: "menubar"});
nativeMenuBar.createMacBuiltin && nativeMenuBar.createMacBuiltin("Postbird");

var menu = {
  '': {
    
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
      gui.Window.get().reload();
    },
    Help: {
      click: function() {
        var help = global.HelpScreen.open();
        help.activatePage("get-postgres");
      }
    }
  }
};

//gui.Window.get().menu = nativeMenuBar;

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

App.on('database.changed', function (db) {
  checkDbMenu();
});

App.on('tab.changed', function (tabId) {
  checkDbMenu();
});
