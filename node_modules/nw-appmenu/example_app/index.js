var gui = require('nw.gui');
var AppMenu = require('../main.js');

var menu = {
  '': {
    '~~~ example item ~~~': {
      click: function () {
        window.alert('click Example App -> "example item"');
      },
      key: 'e',
    }
  },
  'File': {
    'Open': {
      click: function () {
        window.alert('File -> Open');
      },
      key: 'o'
    },
    'Import file': {
      click: function () { },
      key: 'i',
      modifiers: 'cmd+shift'
    }
  },
  'Edit': {
    '!! Extending native menu !!': {}
  },
  'Custom Menu': {
    'Refresh': function () {
      window.alert('Custom Menu -> Refresh');
    },
    'Rename': {
      click: function () { },
      enabled: false
    },
    'Export': {
      click: function () {
        window.alert('Custom Menu -> Export');
      }
    },
    'enable "Delete"': {
      click: function () {
        AppMenu.enableItem("Custom Menu", "Delete");
      }
    },
    'disable "Delete"': {
      click: function () {
        AppMenu.disableItem("Custom Menu", "Delete");
      }
    },
    'separator': 'separator',
    'Delete': {
      click: function () {
        window.alert('Custom Menu -> Export');
      },
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
    Reload: {
      click: function () {
        gui.Window.get().reloadDev();
      },
      key: 'r'
    },
    Help: function() {
      window.alert("help window");
    }
  }
};

var nativeMenuBar = new gui.Menu({type: "menubar"});
nativeMenuBar.createMacBuiltin && nativeMenuBar.createMacBuiltin("AppMenu");

AppMenu.extend(nativeMenuBar, menu);
gui.Window.get().menu = nativeMenuBar;

// Or use AppMenu.createAndExtend(menu);
// as shortcut

// bind buttons

window.$ = global.$ = function (selector) {
  return document.querySelector(selector);
};

$('#toggle-inspector').addEventListener('click', function () {
  AppMenu.callMenuItem("Window", "Inspector");
});

$('#disable-copy').addEventListener('click', function (event) {
  var text = event.target.innerText;
  if (text.includes("Enable")) {
    event.target.innerText = "Disable Copy";
    AppMenu.enableItem("Edit", "Copy");
  } else {
    event.target.innerText = "Enable Copy";
    AppMenu.disableItem("Edit", "Copy");
  }
});

var win = gui.Window.get();
win.focus();