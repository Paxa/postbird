global.DbScreenView = jClass.extend({
  init: function (handler) {
    this.handler = handler;

    this.content = $u(App.renderView('main'));

    this.databaseSelect = this.content.find('.databases select');
    this.tablesList = this.content.find('.sidebar .tables ul');
    this.sidebar = this.content.find('.sidebar');

    this.topTabs = this.content.find('.main > .window-tabs > .tab, .sidebar ul.extras li[tab]');
    this.tabContents = this.content.find('.main > .window-content');

    this.initializePanes();
    this.initEvents();
  },

  initEvents: function() {
    this.topTabs.each(function(i, el) {
      $u(el).bind('click', function(e) {
        var tabName = el.getAttribute('tab');
        e.preventDefault();
        this.showTab(tabName);
      }.bind(this));
    }.bind(this));

    this.sidebar.find('a.addTable').bind('click', this.newTableDialog.bind(this));
    this.sidebar.find('a.reloadStructure').bind('click', this.reloadStructure.bind(this));

    this.databaseSelect.bind('change', function (e) {
      var value = '' + $u(e.target).val();

      if (value == '' || value == '**create-db**') {
        this.hideDatabaseContent();
      } else {
        this.showDatabaseContent();
      }

      if (value == '**create-db**') {
        e.preventDefault();
        new Dialog.NewDatabase(this.handler);
        $u(e.target).val('');
      } else if (value != '') {
        this.handler.selectDatabase(value);
      }
    }.bind(this));

    var tablesBlock = this.content.find('.sidebar .tables');
    this.content.find('.show-system-tables input').bind('change', function(e) {
      var checkbox = e.target;
      if (checkbox.checked) {
        tablesBlock.removeClass('without-system-tables');
      } else {
        tablesBlock.addClass('without-system-tables');
      }
    });

    new SidebarResize(this.content.find('.resize-handler'));
  },

  showDatabaseContent: function () {
    this.sidebar.addClass('database-selected');
  },

  hideDatabaseContent: function() {
    this.sidebar.removeClass('database-selected');
  },

  initializePanes: function () {
    ['Users', 'Extensions', 'Query', 'Structure'].forEach(function(paneName) {
      this[paneName.toLowerCase()] = new global.Panes[paneName](this);
    }.bind(this));
  },

  renderDbList: function (databases) {
    this.databaseSelect.empty();
    this.databaseSelect.append($u('<option>'))

    databases.forEach(function(dbname) {
      this.databaseSelect.append($dom(
        ['option', {value: dbname}, dbname]
      ));
    }.bind(this));

    this.databaseSelect.append($dom(
      ['option', {disabled: true}, '-----']
    ));

    this.databaseSelect.append($dom(
      ['option', {value: '**create-db**'}, 'Create database']
    ));
  },

  renderTablesAndSchemas: function (data, currentSchema, currentTable) {
    this.tablesList.empty();
    var _this = this;
    $u.each(data, function (schema, tables) {
      var schemaTree = DOMinate(['li', ['span', schema], {'schema-name': schema}, ['ul$list']]);
      if (schema == 'public') $u(schemaTree[0]).addClass('open');

      $u(schemaTree[0]).find('span').bind('click', function() {
        $u(schemaTree[0]).toggleClass('open');
      });

      // open if selected
      if (currentSchema == schema) {
        $u(schemaTree[0]).addClass('open');
      }

      data[schema].forEach(function(table) {
        var tableNode = $dom(['li', table.table_name, {'table-name': table.table_name}]);

        $u(tableNode).single_double_click(function(e) {
          e.preventDefault();
          _this.handler.tableSelected(schema, table.table_name, tableNode);
        }, function(e) {
          e.preventDefault();
          _this.renameTable(tableNode, schema, table.table_name);
        }, 170);

        $u.contextMenu(tableNode, {
          'View': function () {
            _this.handler.tableSelected(schema, table.table_name, tableNode);
          },
          'separator': 'separator',
          'Rename': function () {
            _this.renameTable(tableNode, schema, table.table_name);
          },
          'Truncate table' : function () {},
          'Drop table': function() {
            _this.handler.dropTable(schema, table.table_name);
          },
          'Show table SQL': function () {}
        });

        $u(schemaTree.list).append(tableNode);

        if (currentSchema == schema && table.table_name == currentTable) {
          $u(tableNode).addClass('selected');
        }
      });

      _this.tablesList.append(schemaTree[0]);
    });
  },

  reloadStructure: function() {
    this.handler.fetchTablesAndSchemas();
  },

  renameTable: function (node, schema, tableName) {
    node = $u(node);
    node.html('<input value="' + tableName + '" type=text>');
    var input = node.find('input');
    input.focus();
    setTimeout(function() {
      input[0].selectionStart = input[0].selectionEnd;
    }, 20)

    input.bind('keyup', function(e) {
      if (e.keyCode == 27) {
        node.html(tableName);
      }
    });

    input.bind('keypress', function(e) {
      if (e.keyCode == 13) {
        // Enter key pressed
        var newValue = e.target.value;
        node.html(e.target.value);
        this.handler.renameTable(schema, tableName, newValue);
      }
    }.bind(this));
  },

  showTab: function(name) {
    if (this.currentTab) {
      this.topTabs.filter('.' + this.currentTab).removeClass('active');
      this.tabContents.filter('.' + this.currentTab).removeClass('active');
    }

    this.topTabs.filter('.' + name).addClass('active');
    this.tabContents.filter('.' + name).addClass('active');
    this.currentTab = name;
    var currentTabEl = this.tabContents.filter('.' + this.currentTab);

    if (!currentTabEl.attr('unchangable')) {
      currentTabEl.empty().html('<span class="tab-loader">Getting data ...</span>');
    }

    console.log(name + 'TabActivate', typeof this.handler[name + 'TabActivate']);
    if (this.handler[name + 'TabActivate']) this.handler[name + 'TabActivate']();
  },

  setTabContent: function (tabName, content) {
    var container = this.tabContents.filter('.' + tabName);
    container.empty().append(content);
  },

  tabContent: function (tabName) {
    return this.tabContents.filter('.' + tabName);
  },

  renderContentTab: function (data) {
    var node = App.renderView('content_tab', {data: data});
    this.setTabContent('content', node);
    var content = this.tabContent('content');
    content.find('span.text').bind('dblclick', function(e) {
      $u.stopEvent(e);
      $u(e.target.parentNode).toggleClass('expanded');
    });
  },

  newTableDialog: function () {
    new Dialog.NewTable(this.handler);
  },

  switchToHerokuMode: function (name, databseUrl) {
    this.content.find('.databases > *').hide();
    var herokuHeader = DOMinate(['div.heroku-mode',
      ['span', "Heroku app:"],
      ['a$name', name]
    ]);

    $u(herokuHeader.name).bind('click', function() {
      window.alertify.alert(databseUrl);
    });

    this.content.find('.databases').append(herokuHeader[0]);
  }
});