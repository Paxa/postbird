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
require('./app/views/dialog');
require('./app/views/dialogs/new_user');

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

function renderHome () {
  renderPage('home', {}, function(node) {
    var element = $u(node);
    var form = element.find('form');
    element.find('form').bind('submit', function(e) {
      e.preventDefault();
      var options = {
        host: form.find('[name=host]').val(),
        port: form.find('[name=port]').val(),
        user: form.find('[name=user]').val(),
        password: form.find('[name=password]').val(),
        database: 'template1'
      };

      connectToServer(options, function () {
        renderMainScreen();
      });
    });
  });
}

function renderMainScreen () {
  renderPage('main', {}, function(node) {
    var element = $u(node);
    var list = element.find('ul.databases');
    query('SELECT datname FROM pg_database WHERE datistemplate = false;', function(rows) {
      rows.rows.forEach(function(dbrow) {
        console.log(dbrow);
        var tree = DOMinate([
          'li', ['a', dbrow.datname]
        ]);
        list.append(tree[0]);
      });
    });
  })
}

function connectToServer (options, callback) {
  var connectString = 'postgres://' + options.user + ':' + options.password + '@' + options.host + ':' + options.port + '/' + options.database;
  console.log(connectString);
  connection = anyDB.createConnection(connectString, function (val) {
    console.log(val)
    callback && callback(val);
  });
  return;
  var client = new pg.Client(options);

  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });
}

function query(sql, callback) {
  connection.query(sql, function (error, result) {
    if (error) {
      console.error(error);
    } else {
      console.log(result);
      if (callback) callback(result);
    }
  });
}

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
