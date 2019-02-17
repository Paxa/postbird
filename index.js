global.errorReporter = require('./lib/error_reporter');
require('./lib/object_extras');

require('./lib/dominate');
require('./lib/alertify');
require('./lib/node_lib');
//global.AppMenu = require('nw-appmenu');
require('./lib/sidebar_resize');
require('./lib/query_tab_resizer');
require('./lib/widgets/generic_table');
require('./lib/psql_runner');
require('./lib/sql_importer');
require('./lib/pg_dump_runner');
require('./lib/sql_exporter');
require('./lib/pg_type_names');
require('./lib/sql_snippets');
require('./lib/resizable_columns');

global.node.colors = require('colors');
global.node.colors.enabled = true;

require('./app');
require('./app/views/pane');
require('./app/connection');
require('./app/view_helpers');
require('./app/db_screen');
require('./app/login_components/heroku_client');
require('./app/login_components/login_postgres_url_form');
require('./app/login_components/login_standard_form');
require('./app/login_screen');
require('./app/help_screen');
require('./app/views/db_screen_view');
require('./app/views/snippets');

require('./app/views/dialog');
require('./app/views/dialogs/new_user');
require('./app/views/dialogs/new_table');
require('./app/views/dialogs/edit_user');
require('./app/views/dialogs/new_database');
require('./app/views/dialogs/new_column');
require('./app/views/dialogs/edit_column');
require('./app/views/dialogs/new_index');
require('./app/views/dialogs/import_file');
require('./app/views/dialogs/heroku_connection');
require('./app/views/dialogs/list_languages');
require('./app/views/dialogs/export_file');
require('./app/views/dialogs/show_sql');
require('./app/views/dialogs/edit_procedure');
require('./app/views/dialogs/def_procedure');
require('./app/views/dialogs/user_grants');
require('./app/views/dialogs/edit_value');
require('./app/views/dialogs/related_records');

global.Model = require('./app/models/all');

require('./app/controllers/import_controller');
require('./app/controllers/export_controller');
var UpdatesController = require('./app/controllers/updates_controller');
var ImportController = require('./app/controllers/import_controller');

require('./app/history_window');

var CliUtil = require('./lib/cli_util');

global.$u = window.$u = window.jQuery;


/*
global.$ = function (selector) {
  return document.querySelector(selector);
};
*/

global.$dom = function(tags) { return global.DOMinate(tags)[0]; };

require('./app/utils');

// eslint-disable-next-line
function reloadCss() {
  var queryString = '?reload=' + new Date().getTime();
  global.$u('link[rel="stylesheet"]').each(function () {
    this.href = this.href.replace(/\?.*|$/, queryString);
  });
}

//var gui = require('nw.gui');
//global.gui = gui;
global.electron = require('electron');

electron.ipcRenderer.on('open-file', function(event, message) {
  console.log('open-file', event, message);
});

electron.ipcRenderer.on('open-url', function(event, url) {
  CliUtil.resolveArg(url, (resultUrl) => {
    console.log('CliUtil.resolveArg', resultUrl);
    App.openConnection(resultUrl);
  });
});

$(window).on('window-ready', () => {
  electron.ipcRenderer.send('main-window-ready', {});
});

require('./app/top_menu');

var cliArgs = electron.remote.process.argv;
if (cliArgs.length > 2) {
  var connectionStr = cliArgs[2];
  if (connectionStr.startsWith("postgres://")) {
    App.cliConnectString = connectionStr;
  } else {
    window.alert(`Can't recognize argument ${cliArgs[2]}\nExpected postgres://user@server/dbname`);
  }
}

$(document).ready(function() {
  global.App.init();
  //renderHome();
  $(window).bind('resize', function () {
    global.App.setSizes();
  });

  $u.makeDroppable(document.body, function (path) {
    var importer = new ImportController();
    importer.filename = path;
    importer.showImportDialog();
  });

  window.Mousetrap.bind("down", function () {
    GenericTable.keyPressed('down');
    return false;
  });

  window.Mousetrap.bind("up", function () {
    GenericTable.keyPressed('up');
    return false;
  });

  window.Mousetrap.bind(["backspace", "del"], function () {
    GenericTable.keyPressed('backspace');
  });

  electron.ipcRenderer.on('Snippet.insert', function(event, message) {
    console.log('Snippet.insert', event, message);
    Pane.Content.insertSnippet(message);
  });

  setTimeout(function () {
    console.log("Checking updates info");
    (new UpdatesController).checkUpdates();
  }, 10000);

  /*
  var win = gui.Window.get();
  win.focus();

  win.on('closed', function() {
    if (global.App.snippersWin) {
      global.App.snippersWin.close();
    }
    if (global.App.historyWin) {
      global.App.historyWin.close();
    }
  });
  */

  var mainWindow = electron.remote.app.mainWindow;
  mainWindow.on('focus', () => {
    document.body.classList.remove('unfocused');
  });
  mainWindow.on('blur', () => {
    document.body.classList.add('unfocused');
  });
});
