var electron = require('electron');
var BrowserWindow = electron.remote.BrowserWindow;

global.HistoryWindow = {
  init: function () {

    if (App.historyWin) {
      App.historyWin.focus();
      return;
    }

    newWindow = new BrowserWindow({
      width: 775,
      height: 420,
      title: "Console",
      show: true,
      webPreferences: {
        webSecurity: false,
        allowDisplayingInsecureContent: true,
        allowRunningInsecureContent: true
      }
    });

    logger.info(global.log);
    logger.info(log.info);
    logger.info('file://' + App.root + '/views/history_window.html');
    newWindow.loadURL('file://' + App.root + '/views/history_window.html');

    newWindow.webContents.toggleDevTools();

    newWindow.webContents.on('did-finish-load', function () {
      newWindow.webContents.send('App.logEvents', App.logEvents);
      App.on("log.message", function (event) {
        newWindow.webContents.send('App.logEvents.add', event);
      });
    });

    /*
    var newWindow = window.open('blank.html', {
      width: 775,
      height: 420,
      show: false
    });
    */

    /*
    var node = App.renderView("history", {events: global.App.logEvents});
    var globalConsole = console;
    var bindEvents = this.bindEvents.bind(this);

    this.hljs = window.hljs;
    this.win = newWindow;

    var webContents = newWindow.webContents;

    webContents.on('did-finish-load', function () {
      console.log("did-finish-load");
      console.log(this);
      //newWindow.window.console = globalConsole;
      global.console = globalConsole;
      newWindow.window.document.title = "Console";
      $u(newWindow.window.document.body).empty();
      $u(newWindow.window.document.body).fasterAppend(node);

      newWindow.show();
      newWindow.focus();
      bindEvents();
    });
    */

    newWindow.on('closed', function() {
      App.historyWin = null;
    });

    App.historyWin = newWindow;
  },

  reloadContent: function () {
    var body = $u(this.win.window.document.body);
    body.empty();
    var node = App.renderView("history", {events: global.App.logEvents});
    body.fasterAppend(node);
    this.bindEvents();
  },

  $: function (selector) {
    return this.win.window.document.querySelector(selector);
  },

  bindEvents: function () {
    $u(this.$('button.reload-btn')).bind('click', this.reloadContent.bind(this));
  },

};
