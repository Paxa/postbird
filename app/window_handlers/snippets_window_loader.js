var jQuery = require(__dirname + '/../public/jquery.js');
require(__dirname + '/../lib/node_lib');
require(__dirname + '/../lib/object_extras');

require(__dirname + '/../lib/dominate');
require(__dirname + '/../lib/alertify');
require(__dirname + '/../lib/sql_snippets');
require(__dirname + '/../lib/widgets/generic_table');
var RenderView = require(__dirname + '/../app/components/render_view');

require(__dirname + '/../lib/error_reporter');

const fs = require('fs');
const path = require('path');
const remote = require('electron').remote;

global.EventEmitter2 = require('eventemitter2').EventEmitter2;
global.logger = global.log = require(__dirname + '/../app/logger').make('info');

global.App = {
  init: function () {
    RenderView.pugCacheLoad();
  },
  renderView: RenderView.renderView.bind(RenderView)
};

global.electron = require('electron');
global.App.remote = remote;

global.$u = window.$u = jQuery;
global.$ = function (selector) {
  return document.querySelector(selector);
};

global.$dom = function(tags) { return global.DOMinate(tags)[0]; };

require(__dirname + '/../app/utils');

var SnippetsWindow = {
  renderContent: function () {
    this.content = $u(document.body);

    var snippetsPath = path.join(remote.app.getPath('userData'), 'custom_snippets.json');
    var customSnippets = {};
    if (fs.existsSync(snippetsPath)) {
      customSnippets = JSON.parse(fs.readFileSync(snippetsPath))
    }
    this.mergedSnippets = Object.assign({}, SqlSnippets, customSnippets);

    var node = App.renderView("snippets", {snippets: this.mergedSnippets});
    this.content.empty();
    this.content.fasterAppend(node);

    this.$ = function (selector) {
      return document.querySelector(selector);
    };

    this.view = {
      list: $u(this.$('.snippets-window > ul')),
      preview: $u(this.$('.snippets-window > .preview')),
      footer: $u(this.$('.snippets-window > footer')),
    };
    this.view.listItems = this.view.list.find('li');

    this.view.listItems.bind('click', (event) => {
      this.activateItem($u(event.target).attr('snippet'));
    });

    this.activateItem(this.view.listItems.attr('snippet'));
  },

  activateItem: function (name) {
    this.view.list.find('.selected').removeClass('selected');
    var element = this.view.list.find('[snippet="' + name + '"]');
    element.addClass('selected');

    var snippet = this.mergedSnippets[name];
    this.currentSnippet = snippet;

    var node = App.renderView("snippet_preview", {snippet: snippet});
    this.view.preview.empty();
    this.view.preview.fasterAppend(node);

    $u.textContextMenu(this.view.preview.find('.preview-content'), window);
    hljs.highlightBlock(this.view.preview.find('code')[0]);

    this.view.preview.find('[exec="insert"]').bind('click', () => {
      this.sendToMainWindow('Snippet.insert', "\n\n" + snippet.sql);
    });
  },

  sendToMainWindow: function (event, sql) {
    var mainWindow = electron.remote.app.mainWindow;
    mainWindow.send(event, sql);
  }
};

jQuery(document).ready(() => {
  App.init();
  SnippetsWindow.renderContent();
});
