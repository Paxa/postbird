//require('./lib/zepto');
require('./lib/dominate');
require('./lib/jquery.class');
require('./lib/alertify');
require('./lib/arg');
require('./lib/node_lib');
require('./lib/sidebar_resize');

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

Zepto(document).ready(function() {
  global.App.init();
  //renderHome();
  Zepto(window).bind('resize', function () {
    global.App.setSizes();
  });

  var mb = new gui.Menu({type:"menubar"});
  mb.createMacBuiltin && mb.createMacBuiltin("Postbird");
  gui.Window.get().menu = mb;

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