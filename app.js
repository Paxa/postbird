var remote = require('electron').remote;

global.EventEmitter2 = require('eventemitter2').EventEmitter2;
global.logger = global.log = require('./app/logger').make('info');

//require('./sugar/sugar');

var RenderView = require('./app/components/render_view');

global.App = {
  root: process.mainModule.filename.replace(/\/index.html/, ''),
  activeTab: null,
  tabs: [], // {name, content, is_active}

  init: function () {
    RenderView.jadeCacheLoad();
    this.container = $('#content');
    this.tabsContainer = $('#tabs');
    // skip first page
    this.addConnectionTab();
    this.activateTab(0);

    log.info('Loaded in ' + (Date.now() - remote.BrowserWindow.ApplicationStart) + 'ms');
    /* auto connect, for development *\/

    this.loginScreen.onFormSubmit(false, function() {
      setTimeout(function() {
        this.activeTabObj().instance.view.databaseSelect.val('ds2').change();
      }.bind(this), 50);
    }.bind(this));

    /* --- auto connect */

    this.setSizes();
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

    tabData.tabHandler.bind('click', function() {
      tabData.activate();
    });

    tabData.activate = function () {
      if (App.tabs.indexOf(tabData) == -1) {
        log.info('Try to activate removed tab', tabData);
      }
      App.activateTab(App.tabs.indexOf(tabData));
    };

    $u(tree.close).bind('click', function(e) {
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
      this.tabs.forEach(function (tab, tabIndex) {
        if (tab.instance instanceof LoginScreen) {
          this.activateTab(tabIndex);
        }
      }.bind(this));
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

    var tabs = this.tabs.filter(function (tab) {
      if (tab.instance == this.helpScreen) {
        return true
      }
    }.bind(this));

    return !!tabs.length;
  },

  renderView: RenderView.renderView.bind(RenderView),

  setSizes: function() {
    var height = $u(window).height();
    var topOffset = $u('body > #tabs').height();
    $u('body > #content').css('height', height - topOffset);
  },

  startLoading: function (message, timeout) {
    if (this.loader) this.loader.hide();
    this.stopLoading();

    this.loader = this.renderView('_loader', {message: message});
    $u(window.document.body).append(this.loader);

    if (timeout === undefined) timeout = 300;

    this.loaderTimeout = setTimeout(function() {
      delete this.loaderTimeout;
      this.loader.addClass('appear');
    }.bind(this), 300);
  },

  stopLoading: function () {
    if (this.loader) {
      if (this.loaderTimeout) clearTimeout(this.loaderTimeout);
      var loader = this.loader;
      delete this.loader;
      loader.removeClass('appear');
      setTimeout(function() {
        loader.remove();
      }, 250);
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

global.App.logger.onAny(function () {
  var event = {type: this.event, time: (new Date()), args: Array.prototype.slice.call(arguments)};
  global.App.logEvents.push(event);
  if (global.App._events["log.message"]) global.App.emit("log.message", event);
});

