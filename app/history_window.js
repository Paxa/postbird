global.HistoryWindow = {
  init: function () {
    if (App.historyWin) {
      App.historyWin.focus();
      return;
    }

    var newWindow = gui.Window.open('blank.html', {
      width: 775,
      height: 420,
      toolbar: global.gui.App.manifest.window.toolbar,
      show: false
    });

    var node = App.renderView("history", {events: global.App.logEvents});
    var globalConsole = console;
    var bindEvents = this.bindEvents.bind(this);

    this.hljs = window.hljs;
    this.win = newWindow;

    newWindow.on('document-end', function () {
      newWindow.window.console = globalConsole;
      global.console = globalConsole;
      newWindow.window.document.title = "Console";
      $u(newWindow.window.document.body).empty();
      $u(newWindow.window.document.body).fasterAppend(node);

      newWindow.show();
      newWindow.focus();
      bindEvents();
    });

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
