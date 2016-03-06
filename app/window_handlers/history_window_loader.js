require(__dirname + '/../lib/dominate');
require(__dirname + '/../lib/jquery.class');
require(__dirname + '/../lib/alertify');
require(__dirname + '/../lib/node_lib');
require(__dirname + '/../lib/mousetrap');
require(__dirname + '/../lib/widgets/generic_table');
var RenderView = require(__dirname + '/../app/components/render_view');

require(__dirname + '/../lib/error_reporter');
require('classy/object_extras').extendGlobal();

var remote = require('electron').remote;

global.EventEmitter2 = require('eventemitter2').EventEmitter2;
global.logger = global.log = require(__dirname + '/../app/logger').make('info');

global.App = {
  init: function () {
    RenderView.jadeCacheLoad();
  },
  renderView: RenderView.renderView.bind(RenderView)
};

global.electron = require('electron');
global.App.remote = remote;

global.$u = window.$u = Zepto;
global.$ = function (selector) {
  return document.querySelector(selector);
};

global.$dom = function(tags) { return global.DOMinate(tags)[0]; };

require(__dirname + '/../app/utils');

function renderContent() {
  var node = App.renderView("history", {events: global.App.logEvents});
  $u(document.body).empty();
  $u(document.body).fasterAppend(node);
  $('.history-window ul').scrollTop = $('.history-window ul').scrollHeight;
  $u('.reload-btn').on('click', renderContent);
  $u('.clear-btn').on('click', function () {
    App.logEvents = [];
    renderContent()
  });
}

Zepto(document).ready(function() {
  App.init();

  electron.ipcRenderer.on('App.logEvents', function(event, messages) {
    //logger.info(event, message);
    App.logEvents = messages;
    renderContent();
  });

  electron.ipcRenderer.on('App.logEvents.add', function(event, message) {
    //logger.info(event, message);
    App.logEvents.push(message);
    renderContent();
  });

  window.Mousetrap.bind("command+k", function () {
    App.logEvents = [];
    renderContent();
    return false;
  });

});