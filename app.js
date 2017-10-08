var remote = require('electron').remote;

require('./lib/node_lib');
global.EventEmitter2 = require('eventemitter2').EventEmitter2;
global.logger = global.log = require('./app/logger').make('info');

//require('./sugar/sugar');

var RenderView = require('./app/components/render_view');

global.App = {
  root: process.mainModule.filename.replace(/\/index.html/, ''),
  activeTab: null,
  tabs: [], // {name, content, is_active}

  init: function () {
    RenderView.pugCacheLoad();
    this.container = $('#content');
    this.tabsContainer = $('#tabs');
    // skip first page
    this.addConnectionTab();
    this.activateTab(0);

    log.info('Loaded in ' + (Date.now() - remote.BrowserWindow.ApplicationStart) + 'ms');
    console.log('Loaded in ' + (Date.now() - remote.BrowserWindow.ApplicationStart) + 'ms');
    /* auto connect, for development *\/

    this.loginScreen.onFormSubmit(false, () => {
      setTimeout(() => {
        this.activeTabObj().instance.view.databaseSelect.val('ds2').change();
      }, 50);
    });

    /* --- auto connect */

    this.setSizes();
    $(window).trigger('window-ready');
  },

  addTab: function (name, contentHtml, instance) {
    var tree = DOMinate([ 'div.tab', name, ['a$close.close', '']]);
    $u(this.tabsContainer).prepend(tree[0]);

    var contentTree = DOMinate([ 'div.tabContent' ]);
    if (typeof contentHtml == "string") {
      contentTree[0].innerHTML = contentHtml;
    } else {
      $u(contentTree[0]).append(contentHtml);
    }

    $u(contentTree[0]).hide();
    $u(this.container).prepend(contentTree[0]);

    var tabData = {
      instance: instance,
      name: name,
      tabHandler: $u(tree[0]),
      content: $u(contentTree[0]),
      is_active: false
    };

    this.tabs.unshift(tabData);
    if (this.activeTab !== null) this.activeTab += 1;

    tabData.tabHandler.bind('click', () => {
      tabData.activate();
    });

    tabData.activate = function () {
      if (App.tabs.indexOf(tabData) == -1) {
        log.info('Try to activate removed tab', tabData);
      }
      App.activateTab(App.tabs.indexOf(tabData));
    };

    $u(tree.close).bind('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      App.closeTab(App.tabs.indexOf(tabData));
    });

    return tabData;
  },

  closeTab: function(index) {
    var tab = this.tabs[index];
    tab.tabHandler.remove();
    tab.content.remove();
    if (tab.instance.destroy) tab.instance.destroy();
    this.tabs.splice(index, 1);

    if (this.activeTab == index) {
      if (this.activeTab == 0 && this.tabs.length == 0) {
        this.activeTab = null;
        this.addConnectionTab();
      } else if (this.activeTab == 0 && this.tabs.length > 0) {
        this.activeTab = null;
        this.activateTab(index);
      } else if (this.activeTab == index) {
        this.activeTab = null;
        this.activateTab(index - 1);
      }
    } else if (this.activeTab > index) {
      this.activeTab -= 1;
    }
  },

  closeCurrentTab: function () {
    if (this.tabs[this.activeTab].instance instanceof LoginScreen) {
      console.log("Can not close 'Connection' tab");
    } else {
      this.closeTab(this.activeTab);
    }
  },

  activateLoginTab: function () {
    if (this.tabs[this.activeTab].instance instanceof LoginScreen) {
      console.log("Current tab is 'Connection' tab");
    } else {
      this.tabs.forEach((tab, tabIndex) => {
        if (tab.instance instanceof LoginScreen) {
          this.activateTab(tabIndex);
        }
      });
    }
  },

  lastAddedTab: function () {
    return this.tabs[this.tabs.length - 1];
  },

  activateTab: function (idx) {
    if (!this.tabs[idx]) throw "There is no tab with index " + idx;

    if (this.activeTab !== null) {
      this.currentTab.tabHandler.removeClass('active');
      this.currentTab.content.hide();
    }

    this.activeTab = idx;
    this.tabs[idx].tabHandler.addClass('active');
    this.tabs[idx].content.show();
    this.emit('tab.changed', idx);
  },

  activeTabObj: function () {
    return this.tabs[this.activeTab];
  },

  addConnectionTab: function() {
    this.loginScreen = new LoginScreen();
    var tab = this.addTab('Connection', this.loginScreen.content, this.loginScreen);
    tab.tabHandler.find('.close').hide();
    return tab;
  },

  addDbScreen: function(connection, connectionName, options, do_activate) {
    log.info(connectionName, do_activate);
    if (connectionName == '') connectionName = false;
    var dbs = new DbScreen(connection, options);
    return this.addTab(connectionName || 'DB', dbs.view.content, dbs);
  },

  addHelpScreen: function() {
    this.helpScreen = new HelpScreen();
    return this.addTab('Help', this.helpScreen.content, this.helpScreen);
  },

  helpScreenOpen: function () {
    if (!this.helpScreen) return false;

    var tabs = this.tabs.filter((tab) => {
      if (tab.instance == this.helpScreen) {
        return true
      }
    });

    return !!tabs.length;
  },

  renderView: RenderView.renderView.bind(RenderView),

  setSizes: function() {
    var height = $u(window).height();
    var topOffset = $u('body > #tabs').height();
    $u('body > #content').css('height', height - topOffset);
  },

  startLoading: function (message, timeout, options) {
    if (!options) options = {};

    if (this.loader) this.loader.hide();
    this.stopLoading();

    this.loader = this.renderView('_loader', {
      message: message,
      cancel: options.cancel
    });

    if (options.cancel) {
      $u(this.loader).find('a.cancel-btn').on('click', () => {
        options.cancel();
      });
    }

    $u(window.document.body).append(this.loader);

    if (timeout === undefined) timeout = 300;

    this.loaderTimeout = setTimeout(() => {
      delete this.loaderTimeout;
      this.loader.addClass('appear');
    }, timeout);
  },

  stopLoading: function () {
    if (this.loader) {
      if (this.loaderTimeout) clearTimeout(this.loaderTimeout);
      var loader = this.loader;
      delete this.loader;
      loader.removeClass('appear');
      setTimeout(() => {
        loader.remove();
      }, 250);
    }
  },

  stopRunningQuery: function () {
    if (this.currentTab.instance.connection) {
      this.currentTab.instance.connection.stopRunningQuery();
    }
  },

  openConnection: function (options, connectionName, callback) {
    this.startLoading("Connecting...");

    if (typeof options == 'string') {
      options = Connection.parseConnectionString(options);
      if (!connectionName) {
        connectionName = options.host;
      }
    }

    var conn = new Connection();
    conn.connectToServer(options, (status, message) => {
      this.stopLoading();
      if (status) {
        var tab = this.addDbScreen(conn, connectionName, options);
        tab.activate();
        if (callback) callback(tab);
      } else {
        window.alertify.alert(this.humanErrorMessage(message));
        if (callback) callback(false);
      }
    });
  },

  humanErrorMessage: (error) => {
    if (error == "connect ECONNREFUSED") {
      return "Connection refused.<br>Make sure postgres is running";
    } else if (error.match(/^getaddrinfo ENOTFOUND/)) {
      var host = error.match(/^getaddrinfo ENOTFOUND\s+(.+)$/);
      return `Can not resolve host '${host[1]}'`;
    } else {
      return error;
    }
  }
};

Object.defineProperty(App, "currentTab", {
  get: function () {
    return this.activeTabObj();
  },

  set: function (tab_or_id) {
    if (typeof tab_or_id == 'number') {
      this.activateTab(tab_or_id);
    } else {
      if (this.tabs.indexOf(tab_or_id) != -1) {
        this.activateTab(this.tabs.indexOf(tab_or_id));
      } else {
        throw "object is not in App.tabs";
      }
    }
  }
});

Object.defineProperty(App, "currentTable", {
  get: function () {
    if (this.currentTab && this.currentTab.instance) {
      return this.currentTab.instance.table;
    }
  }
});


Object.setPrototypeOf(global.App, new node.events.EventEmitter);

global.App.remote = remote;

global.App.emit = function (eventName) {
  if (!this._events[eventName]) {
    console.log("Fire event '" + eventName + "' but no listeners");
  }
  var fn = node.events.EventEmitter.prototype.emit;
  fn.apply(this, arguments);
}

global.App.logEvents = [];
global.App.logger = new global.EventEmitter2({
  wildcard: true
});

global.App.log = function App_log(type, value1, value2, value3, value4) {
  return this.logger.emit.apply(this.logger, arguments);
}.bind(App);

global.App.logger.onAny((ev, ...args) => {
  if (args[2] && args[2] instanceof Error) {
    args[2] = {
      message: args[2].message
    };
  }
  var event = {type: ev, time: (new Date()), args: args};
  global.App.logEvents.push(event);
  if (global.App._events["log.message"]) global.App.emit("log.message", event);
});

