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

      if (value == '**create-db**') {
        this.hideDatabaseContent();
      } else {
        this.showDatabaseContent();
      }

      if (value == '**create-db**') {
        e.preventDefault();
        new Dialog.NewDatabase(this.handler);
        $u(e.target).val('');
      } else {
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

  // Public API
  setDabase: function (database, callback) {
    this.databaseSelect.val(database);
    this.showDatabaseContent();
    this.handler.selectDatabase(database, callback);
  },

  showDatabaseContent: function () {
    this.sidebar.addClass('database-selected');
  },

  hideDatabaseContent: function() {
    this.sidebar.removeClass('database-selected');
  },

  initializePanes: function () {
    ['Users', 'Extensions', 'Query', 'Structure', 'Contents', 'Procedures', 'Info'].forEach(function(paneName) {
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

    if (this.handler.database) {
      this.databaseSelect.val(this.handler.database);
    }
  },

  renderTablesAndSchemas: function (data, currentSchema, currentTable) {
    this.tablesList.empty();
    $u.contextMenu(this.tablesList, {
      "Create Table": this.newTableDialog.bind(this),
      "Refresh Tables": this.reloadStructure.bind(this)
    });

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
        var tableNode = $dom(['li', table.table_name, {'table-name': table.table_name, 'table-type': table.table_type}]);

        $u(tableNode).single_double_click(function(e) {
          if (e.target.tagName == "INPUT") return;
          e.preventDefault();
          _this.handler.tableSelected(schema, table.table_name, tableNode);
        }, function(e) {
          if (e.target.tagName == "INPUT") return;
          e.preventDefault();
          _this.renameTable(tableNode, schema, table.table_name);
        }, 170);

        if (table.table_type == "BASE TABLE") {
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
              _this.handler.dropTable(schema, table.table_name, function (res, error) {
                if (error) {
                  var errorMsg = "" + error.toString();
                  if (error.detail) errorMsg += "\n----\n" + error.detail;
                  if (error.hint) errorMsg += "\n----\n" + error.hint;
                  window.alert(errorMsg);
                } else {
                  if (_this.handler.currentTable == table.table_name) {
                    _this.eraseCurrentContent();
                  }
                }
              });
            },
            'Show table SQL': function () {
              _this.showTableSql(schema, table.table_name);
            }
          });
        } else if (table.table_type == "VIEW" || table.table_type == "MATERIALIZED VIEW") {
          $u.contextMenu(tableNode, {
            'View': function () {
              _this.handler.tableSelected(schema, table.table_name, tableNode);
            },
            'separator': 'separator',
            'Rename': function () {
              _this.renameTable(tableNode, schema, table.table_name);
            },
            'Drop view': function() {
              _this.handler.dropTable(schema, table.table_name, function (res, error) {
                if (error) {
                  var errorMsg = "" + error.toString();
                  if (error.detail) errorMsg += "\n----\n" + error.detail;
                  if (error.hint) errorMsg += "\n----\n" + error.hint;
                  window.alert(errorMsg);
                } else {
                  if (_this.handler.currentTable == table.table_name) {
                    _this.eraseCurrentContent();
                  }
                }
              });
            },
            'Show view SQL': function () {
              _this.showViewSql(schema, table.table_name);
            }
          });
        }

        $u(schemaTree.list).append(tableNode);

        if (currentSchema == schema && table.table_name == currentTable) {
          $u(tableNode).addClass('selected');
          _this.handler.currentTableNode = $u(tableNode);
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

    $u.listenClickOutside(input, function (action) {
      if (action == 'click') {
        var newValue = input.val();
        if (newValue != tableName) {
          this.handler.renameTable(schema, tableName, newValue);
          tableName = newValue;
        }
      }
      node.html(tableName);
    }.bind(this));

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

    this.handler.activateTab(name);
  },

  setTabMessage: function (message) {
    if (!this.currentTab) return;

    var currentTabEl = this.tabContents.filter('.' + this.currentTab);

    if (!currentTabEl.attr('unchangable')) {
      currentTabEl.empty().html('<span class="tab-message">' + message + '</span>');
    }
  },

  setTabContent: function (tabName, content) {
    var container = this.tabContents.filter('.' + tabName);
    //container.empty().append(content);
    container.removeChildren().fasterAppend(content);
  },

  eraseCurrentContent: function () {
    if (this.currentTab) {
      this.topTabs.filter('.' + this.currentTab).removeClass('active');
      this.tabContents.filter('.' + this.currentTab).removeClass('active').html("");
    }
  },

  tabContent: function (tabName) {
    return this.tabContents.filter('.' + tabName);
  },

  newTableDialog: function () {
    new Dialog.NewTable(this.handler);
  },

  showTableSql: function (schema, table) {
    App.startLoading("Getting table sql...");
    this.handler.getTableSql(schema, table, function (source) {
      App.stopLoading();
      new Dialog.ShowSql("Table " + table, source);
    });
  },

  showViewSql: function (schema, table) {
    App.startLoading("Getting view sql...");
    this.handler.getTableSql(schema, table, function (source) {
      App.stopLoading();
      new Dialog.ShowSql("View " + table, source);
    });
  },

  switchToHerokuMode: function (name, databseUrl) {
    this.content.find('.databases > *').hide();
    var herokuHeader = DOMinate(['div.heroku-mode',
      ['span', "Heroku app:"],
      ['a$name', name]
    ]);

    $u(herokuHeader.name).bind('click', function() {
      new Dialog.HerokuConnection(this, name, databseUrl);
      //window.alertify.alert(databseUrl);
    }.bind(this));

    this.content.find('.databases').append(herokuHeader[0]);
  }
});