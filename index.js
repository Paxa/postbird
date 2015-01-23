//require('./lib/zepto');
require('./lib/dominate');
require('./lib/jquery.class');
require('./lib/alertify');
require('./lib/arg');
require('./lib/node_lib');
require('./lib/app_menu');
//require('./lib/mousetrap');
require('./lib/sidebar_resize');
require('./lib/widgets/generic_table');
require('./lib/psql_runner');
require('./lib/sql_importer');

require('./app');
require('./app/views/pane');
require('./app/connection');
require('./app/view_helpers');
require('./app/db_screen');
require('./app/login_screen');
require('./app/help_screen');
require('./app/views/db_screen');
require('./app/views/panes/users');
require('./app/views/panes/extensions');
require('./app/views/panes/query');
require('./app/views/panes/structure');
require('./app/views/panes/contents');

require('./app/views/dialog');
require('./app/views/dialogs/new_user');
require('./app/views/dialogs/new_table');
require('./app/views/dialogs/edit_user');
require('./app/views/dialogs/new_database');
require('./app/views/dialogs/new_column');
require('./app/views/dialogs/edit_column');
require('./app/views/dialogs/new_index');
require('./app/views/dialogs/import_file');

require('./app/models/base');
require('./app/models/table');
require('./app/models/column');
require('./app/models/saved_conn');

require('./app/controllers/import_controller');

require('./app/heroku_client');

process.on("uncaughtException", function(err) {
  global.log.error('error: ', err.red);
  global.log.info(err.stack);
  window.alert(err);
  return false;
});

global.$u = window.$u = Zepto;
global.$ = function (selector) {
  return document.querySelector(selector);
};

global.$dom = function(tags) { return global.DOMinate(tags)[0]; };

require('./app/utils');

function reloadCss() {
  var queryString = '?reload=' + new Date().getTime();
  global.$u('link[rel="stylesheet"]').each(function () {
    this.href = this.href.replace(/\?.*|$/, queryString);
  });
}

var gui = require('nw.gui');
global.gui = gui;

function objMethods (obj) {
  var methods = []
  for(var key in obj) {
    if (typeof obj[key] == 'function') methods.push(key);
  }
  return methods;
};

Zepto(document).ready(function() {
  global.App.init();
  //renderHome();
  Zepto(window).bind('resize', function () {
    global.App.setSizes();
  });

  var nativeMenuBar = new gui.Menu({type:"menubar"});
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
    'Connection': {
      
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

  window.Mousetrap.bind("command++/", function () {
    console.log("Zoom up");
    return false;
  });

  window.Mousetrap.bind("command+-/", function () {
    console.log("Zoom down");
    return false;
  });

  $u.makeDroppable(document.body, function (path) {
    var importer = new global.ImportController();
    importer.filename = path;
    importer.showImportDialog();
  });

  /*
  window.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    console.log('dragover', e);
  });


  window.addEventListener('drop', function(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log(event);
  });
  */

  // Add some items
  /*
  var a = new gui.MenuItem({ label: 'Item A' })
  a.submenu 
  menu.append(a);
  menu.append(new gui.MenuItem({ label: 'Item B' }));
  menu.append(new gui.MenuItem({ type: 'separator' }));
  menu.append(new gui.MenuItem({ label: 'Item C' }));

  // Remove one item
  // menu.removeAt(1);

  // Popup as context menu
  document.body.addEventListener('contextmenu', function(ev) { 
    ev.preventDefault();
    menu.popup(ev.x, ev.y);
    return false;
  });

  var appMenu = new gui.Menu({ type: 'menubar' });
  gui.Window.get().menu = appMenu;
  var i = new gui.MenuItem({ label: 'Item B' });
  //i.submenu = new gui.Menu({ type: 'menubar' });
  //i.submenu.append(new gui.MenuItem({ label: 'Item B' }));
  appMenu.append(i);
  */

/*
  // Reference to window and tray
  var win = gui.Window.get();
  var tray;

  // Get the minimize event
  win.on('minimize', function() {
    // Hide window
    this.hide();

    // Show tray
    tray = new gui.Tray({ icon: './tray.png' });

    var menu = new gui.Menu();
    menu.append(new gui.MenuItem({ label: 'Restore', click: function() {
      win.restore();
      win.show();
      tray.remove();
      tray = null;
    }}));
    tray.menu = menu;

    // Show window and remove tray when clicked
    tray.on('click', function() {
      console.log('on', 'click');
      win.restore();
      win.show();
      this.remove();
      tray = null;
    });
  });
*/
});