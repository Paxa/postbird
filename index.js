//require('./lib/zepto');
require('./lib/dominate');
require('./lib/jquery.class');
require('./lib/alertify');
require('./lib/arg');
require('./lib/node_lib');
require('./lib/sidebar_resize');
require('./lib/widgets/generic_table');

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

require('./app/models/base');
require('./app/models/table');
require('./app/models/column');

require('./app/heroku_client');

process.on("uncaughtException", function(err) {
  global.log.error('error: ', err.red);
  global.log.info(err.stack);
  window.alert(err);
  return false;
});

global.$u = Zepto;
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
    'Connection': {
      
    },
    'Table': {
      
    },
    'Window': {
      'separator': 'separator',
      Inspector: {
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
        },
        key: "?",
      }
    }
  };

  //gui.Window.get().menu = nativeMenuBar;

  Object.forEach(menu, function (submenuName, submenu) {
    var nativeSubmenu;
    nativeMenuBar.items.forEach(function(es) {
      if (es.label == submenuName) nativeSubmenu = es.submenu;
    });
    if (!nativeSubmenu) {
      nativeSubmenu = new gui.Menu();
      var position = nativeMenuBar.items.length - 1;
      nativeMenuBar.insert(new gui.MenuItem({label: submenuName, submenu: nativeSubmenu}), position);
    }
    Object.forEach(submenu, function (itemName, callback) {
      if (typeof callback == 'string') {
        nativeSubmenu.append(new gui.MenuItem({ type: callback }));
      } else {
        var menuItem;
        if (typeof callback == 'object') {
          var options = {label: itemName};
          Object.forEach(callback, function (key, value) {
            options[key] = value;
          });
          menuItem = new gui.MenuItem(options);
        } else {
          menuItem = new gui.MenuItem({label: itemName});
          menuItem.click = callback;
        }
        nativeSubmenu.append(menuItem);
      }
    });
  });

  gui.Window.get().menu = nativeMenuBar;

  /*
  var shortcut = new gui.Shortcut({
    key: "Cmd+?",
    active : function() {
      console.log("Global desktop keyboard shortcut: " + this.key + " active."); 
    },
    failed : function(msg) {
      // :(, fail to register the |key| or couldn't parse the |key|.
      console.log(msg);
    }
  });

  gui.App.registerGlobalHotKey(shortcut);
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