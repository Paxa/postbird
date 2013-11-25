var jade = require('jade');
//var fs = require('fs');

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

    /* auto connect, for development */

    this.loginScreen.onFormSubmit(false, function() {
      setTimeout(function() {
        this.activeTabObj().instance.view.databaseSelect.val('postgres').change();
      }.bind(this), 50);
    }.bind(this));

    /* --- auto connect */

    this.setSizes();

    var i = $dom(['a.inspector', '@']);
    $u(i).bind('click', function() {
      gui.Window.get().showDevTools();
    });
    $u(this.tabsContainer).prepend(i);
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
        console.log('Try to activate removed tab', tabData);
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
      this.tabs[this.activeTab].tabHandler.removeClass('active');
      this.tabs[this.activeTab].content.hide();
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

  addDbScreen: function(connection, do_activate) {
    var dbs = new DbScreen(connection);
    return this.addTab('DB', dbs.view.content, dbs);
  },

  renderView: function (file, options, callback) {
    var new_options = {};
    var i;
    for (i in ViewHelpers) new_options[i] = ViewHelpers[i].bind(ViewHelpers);
    if (options) {
      for (i in options) new_options[i] = options[i];
    }

    var html = jade.renderFile(App.root + '/views/' + file + '.jade', new_options);

    //  if (err) throw err;
      // App.setContent(html);
      // if (callback) {
      //   callback(App.container);
      //   callback(html);
      // }
    //});

    var node = $u('<div>').html(html).children();
    return $u(node);
  },

  //setContent: function (html) {
  //  App.container.innerHTML = html;
  //},
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
    console.log(name, options);
    var newData = this.savedConnections();
    newData[name] = options;
    window.localStorage.savedConnections = JSON.stringify(newData);
  }
};