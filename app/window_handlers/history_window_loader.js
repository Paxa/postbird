require(__dirname + '/../lib/dominate');
require(__dirname + '/../lib/jquery.class');
require(__dirname + '/../lib/alertify');
require(__dirname + '/../lib/node_lib');
require(__dirname + '/../lib/widgets/generic_table');
require('classy/object_ls');

require(__dirname + '/../lib/error_reporter');
require('classy/object_extras').extendGlobal();

var jade;
var jadeRuntime = require('jade/runtime');
var remote = require('electron').remote;

global.EventEmitter2 = require('eventemitter2').EventEmitter2;
global.logger = global.log = require(__dirname + '/../app/logger').make('info');


//require('./sugar/sugar');

global.App = {
  root: process.mainModule.filename.replace(/\/views\/history_window.html/, ''),

  jadeFn: {},

  renderView: function (file, options) {
    var html;
    var new_options = {};
    var i;

    for (i in ViewHelpers) new_options[i] = ViewHelpers[i].bind(ViewHelpers);

    if (options) {
      for (i in options) new_options[i] = options[i];
    }

    try {
      //var st = Date.now();
      html = this.compileJade(file)(jadeRuntime, new_options);
      //console.log('jade render ' + file + ' in ' + (Date.now() - st) + 'ms');
    } catch (error) {
      console.log("Error compiling '" + App.root + '/views/' + file + '.jade');
      throw error;
    }
    var res = $u.html2collection(html);

    res.find('input, textarea').each(function (i, el) {
      $u.textInputMenu(el);
    });

    return res;
  },

  compileJade: function (file) {
    var filepath = App.root + '/views/' + file + '.jade';
    var content = node.fs.readFileSync(filepath, 'utf-8');

    if (this.jadeFn[file] && this.jadeFn[file].content != content) {
      console.log('remove template cache for: ' + file);
      delete this.jadeFn[file];
    }

    if (!this.jadeFn[file]) {
      if (!jade) {
        log.info('loading jade....');
        jade = require('jade');
      }
      this.jadeFn[file] = jade.compileClient(content, {filename: filepath, pretty: true, compileDebug: true});
      eval("App.jadeFn['" + file + "'] = " + this.jadeFn[file].replace('locals', 'jade, locals'));
      this.jadeFn[file].content = content;
      this.triggerSaveCache();
    }
    return this.jadeFn[file];
  },

  triggerSaveCache: function() {
    if (this.jadeCacheTimeout) {
      clearTimeout(this.jadeCacheTimeout);
    }
    this.jadeCacheTimeout = setTimeout(function() {
      clearTimeout(this.jadeCacheTimeout);
      delete this.jadeCacheTimeout;
      this.jadeCacheSave();
    }.bind(this), 1000);
  },

  jadeCacheSave: function () {
    result = "";
    Object.keys(this.jadeFn).sort().forEach(function(key) {
      var fn = this.jadeFn[key];
      result += 'exports["' + key + '"] = ' + fn.toString() + ";\n";
      result += 'exports["' + key + '"].content = ' + JSON.stringify(fn.content) + ";\n";
    }.bind(this));

    node.fs.writeFileSync('./views/cache.js', result, 'utf8');
    console.log("Jade cache saved!");
  },

  jadeCacheLoad: function() {
    if (node.fs.existsSync('./views/cache.js')) {
      var cache = require('./views/cache');
      if (cache) {
        this.jadeFn = cache;
        //console.log("Loaded templates cache " + Object.keys(this.jadeFn));
      }
    }
  }
};

require(__dirname + '/../app/view_helpers');

logger.info(App);
global.eletron = require('electron');
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
}

Zepto(document).ready(function() {
  eletron.ipcRenderer.on('App.logEvents', function(event, message) {
    //logger.info(event, message);
    App.logEvents = message;
    renderContent();
  });

  eletron.ipcRenderer.on('App.logEvents.add', function(event, message) {
    //logger.info(event, message);
    App.logEvents.push(message);
    renderContent();
  });

});