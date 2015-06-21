global.SnippetsWindow = {
  init: function () {
    if (App.snippersWin) {
      App.snippersWin.focus();
      return;
    }

    var newWindow = gui.Window.open('blank.html', {
      width: 570,
      height: 400,
      toolbar: true,
      show: false
    });

    var node = App.renderView("snippets", {snippets: SqlSnippets});
    var globalConsole = console;
    var bindEvents = this.bindEvents.bind(this);

    this.hljs = window.hljs;
    this.win = newWindow;

    newWindow.on('document-end', function () {
      newWindow.window.console = globalConsole;
      global.console = globalConsole;
      newWindow.window.document.title = "SQL Snippets";
      $u(newWindow.window.document.body).empty();
      $u(newWindow.window.document.body).fasterAppend(node);

      newWindow.show();
      newWindow.focus();
      bindEvents();
    });

    newWindow.on('closed', function() {
      App.snippersWin = null;
    });

    App.snippersWin = newWindow;
  },

  $: function (selector) {
    return this.win.window.document.querySelector(selector);
  },

  bindEvents: function () {
    this.view = {
      list: $u(this.$('.snippets-window > ul')),
      preview: $u(this.$('.snippets-window > .preview')),
      footer: $u(this.$('.snippets-window > footer')),
    };
    this.view.listItems = this.view.list.find('li');

    this.view.listItems.bind('click', function (event) {
      this.activateItem($u(event.target).attr('snippet'));
    }.bind(this));

    this.activateItem( this.view.listItems.attr('snippet') );
  },

  activateItem: function (name) {
    this.view.list.find('.selected').removeClass('selected');
    var element = this.view.list.find('[snippet="' + name + '"]');
    element.addClass('selected');

    var snippet = SqlSnippets[name];
    this.currentSnippet = snippet;

    var node = App.renderView("snippet_preview", {snippet: snippet});
    this.view.preview.empty();
    this.view.preview.fasterAppend(node);

    $u.textContextMenu(this.view.preview.find('code'), this.win.window);
    this.hljs.highlightBlock(this.view.preview.find('code')[0]);

    this.view.preview.find('[exec="insert"]').bind('click', function () {
      var tab = App.currentTab.instance;
      if (tab.currentTab != "query") {
        tab.view.showTab("query")
      }

      global.gui.Window.get().focus();
      tab.view.query.appendText("\n\n" + snippet.sql, 2);
    });
  }

};
