var jade = require('jade');
var fs = require('fs');

var colors = require('colors');

global.log = require('./app/logger').make('info');

require('./sugar/sugar');

global.App = {
  root: process.mainModule.filename.replace(/\/index.html/, ''),
  activeTab: null,
  tabs: [], // {name, content, is_active}

  init: function () {
    this.container = $('#content');
    this.tabsContainer = $('#tabs');
    // skip first page
    this.addConnectionTab();
    this.activateTab(0);

    /* auto connect, for development *\/

    this.loginScreen.onFormSubmit(false, function() {
      setTimeout(function() {
        this.activeTabObj().instance.view.databaseSelect.val('postgres').change();
      }.bind(this), 50);
    }.bind(this));

    /* --- auto connect */

    this.setSizes();
    /*
    var i = $dom(['a.inspector', '@']);
    $u(i).bind('click', function() {
      gui.Window.get().showDevTools();
    });
    $u(this.tabsContainer).prepend(i);

    /*
    var n = $u($dom(['a.inspector', '!!!'])).bind('click', function() {
      Notificator.show("Notification test");
    });
    $u(this.tabsContainer).prepend(n);
    */
  },

  addTab: function (name, contentHtml, instance) {
    var tree = DOMinate([ 'div.tab', name, ['a$close.close', 'x']]);
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
  },

  activeTabObj: function () {
    return this.tabs[this.activeTab];
  },

  addConnectionTab: function() {
    this.loginScreen = new LoginScreen();
    return this.addTab('Connection', this.loginScreen.content, this.loginScreen);
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

  renderView: function (file, options, callback) {
    var new_options = {};
    var i;
    for (i in ViewHelpers) new_options[i] = ViewHelpers[i].bind(ViewHelpers);
    if (options) {
      for (i in options) new_options[i] = options[i];
    }

    var html;
    try {
      html = jade.renderFile(App.root + '/views/' + file + '.jade', new_options);
    } catch (error) {
      console.log("Error compiling '" + App.root + '/views/' + file + '.jade');
      throw error;
    }
    var node = $u('<div>').html(html).children();
    return $u(node);
  },

  setSizes: function() {
    var height = $u(window).height();
    var topOffset = $u('body > #tabs').height();
    $u('body > #content').css('height', height - topOffset);
  },

  savedConnections: function () {
    if (window.localStorage.savedConnections) {
      return JSON.parse(window.localStorage.savedConnections);
    } else {
      return {};
    }
  },

  saveConnection: function (name, options) {
    var newData = this.savedConnections();
    newData[name] = options;
    window.localStorage.savedConnections = JSON.stringify(newData);
  },

  renameConnection: function (oldName, newName) {
    var data = this.savedConnections();
    data[newName] = data[oldName];
    delete data[oldName];
    window.localStorage.savedConnections = JSON.stringify(data);
    return true;
  },

  removeConnection: function (name) {
    var data = this.savedConnections();
    delete data[name];
    window.localStorage.savedConnections = JSON.stringify(data);
    return true;
  },

  startLoading: function (message) {
    if (this.loader) this.loader.hide();
    this.stopLoading();

    this.loader = this.renderView('_loader', {message: message});
    $u(window.document.body).append(this.loader);

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
  },
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