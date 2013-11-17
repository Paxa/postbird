//require('./lib/zepto');
require('./lib/dominate');
require('./lib/jquery.class');
require('./lib/alertify');

require('./app');
require('./app/connection');
require('./app/view_helpers');
require('./app/db_screen');
require('./app/login_screen');
require('./app/views/db_screen');
require('./app/views/pane');
require('./app/views/panes/users');
require('./app/views/panes/extensions');
require('./app/views/panes/query');
require('./app/views/dialog');
require('./app/views/dialogs/new_user');
require('./app/views/dialogs/edit_user');
require('./app/views/dialogs/new_database');

//var anyDB = require('any-db');


process.on("uncaughtException", function(err) {
  console.error('error: ', err);
  console.log(err.stack);
  window.alert(err);
});

//var appRoot = process.mainModule.filename.replace(/\/index.html/, '');

global.$u = Zepto;
//var connection = null;
global.$ = function (selector) {
  return document.querySelector(selector);
};

global.$dom = function(tags) { return global.DOMinate(tags)[0]; };

require('./app/utils');

var gui = require('nw.gui');
global.gui = gui;

Zepto(document).ready(function() {
  global.App.init();
  //renderHome();
  Zepto(window).bind('resize', function () {
    global.App.setSizes();
  });

  var menu = new gui.Menu();

  // Add some items
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
});


//require('./lib/codemirror/codemirror.js');
//require('./lib/codemirror/sql-hint.js');
//require('./lib/codemirror/sql/sql.js');