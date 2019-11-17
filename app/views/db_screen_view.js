const {dialog} = require('electron').remote;

class DbScreenView {

  /*::
  handler: DbScreen
  currentTab: string

  content: JQuery<HTMLElement>
  databaseSelect: JQuery<HTMLElement>
  tablesList: JQuery<HTMLElement>
  sidebar: JQuery<HTMLElement>
  topTabs: JQuery<HTMLElement>
  tabContents: JQuery<HTMLElement>
  currentTableNode: JQuery<HTMLElement>

  extensionsPane: Pane.Extensions
  contentPane: Pane.Content
  queryPane: Pane.Query
  usersPane: Pane.Users
  structurePane: Pane.Structure
  proceduresPane: Pane.Procedures
  infoPane: Pane.Info
  */

  constructor (handler) {
    this.handler = handler;

    this.content = $u(App.renderView('main'));

    this.databaseSelect = this.content.find('.databases select');
    this.tablesList = this.content.find('.sidebar .tables ul');
    this.sidebar = this.content.find('.sidebar');

    this.topTabs = this.content.find('.main > .window-tabs > .tab, .sidebar ul.extras li[tab]');
    this.tabContents = this.content.find('.main > .window-content');

    this.initializePanes();
    this.initEvents();
  }

  initEvents () {
    this.topTabs.forEach((el) => {
      $u(el).bind('click', (e) => {
        var tabName = el.getAttribute('tab');
        e.preventDefault();
        this.showTab(tabName);
      });
    });

    this.sidebar.find('a.addTable').bind('click', this.newTableDialog.bind(this));
    this.sidebar.find('a.reloadStructure').bind('click', this.reloadStructure.bind(this));

    this.sidebar.find('input.filter-tables').bind('keyup', this.filterTables.bind(this));
    this.sidebar.find('span.clear-filter').bind('click', () => {
      this.clearTablesFilter();
    })

    this.databaseSelect.bind('change', (e) => {
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
      } else if (value == '**refresh-list**') {
        $u(e.target).val('');
        e.preventDefault();
        this.handler.fetchDbList();
      } else {
        this.handler.selectDatabase(value, () => {
          this.clearTablesFilter({show: false});
        });
      }
    });

    var tablesBlock = this.content.find('.sidebar .tables');
    this.content.find('.show-system-tables input').bind('change', (e) => {
      var checkbox = e.target /*:: as HTMLInputElement */;
      if (checkbox.checked) {
        tablesBlock.removeClass('without-system-tables');
      } else {
        tablesBlock.addClass('without-system-tables');
      }
    });

    $u.contextMenu(this.tablesList, {
      "Create Table": this.newTableDialog.bind(this),
      "Refresh Tables": this.reloadStructure.bind(this)
    });

    new SidebarResize(this.content.find('.resize-handler'));
  }

  // Public API
  setDabase (database, callback) {
    this.databaseSelect.val(database);
    this.showDatabaseContent();
    this.handler.selectDatabase(database, callback);
  }

  showDatabaseContent () {
    this.sidebar.addClass('database-selected');
  }

  hideDatabaseContent () {
    this.sidebar.removeClass('database-selected');
  }

  initializePanes () {
    ['Users', 'Extensions', 'Query', 'Content', 'Structure', 'Procedures', 'Info'].forEach(paneName => {
      this[paneName.toLowerCase() + "Pane"] = new Pane[paneName](this);
    });
  }

  renderDbList (databases) {
    this.databaseSelect.empty();
    this.databaseSelect.append($u('<option>'))

    databases.forEach((dbname) => {
      this.databaseSelect.append($dom(
        ['option', {value: dbname}, dbname]
      ));
    });

    this.databaseSelect.append($dom(
      ['option', {disabled: true}, '-----']
    ));

    this.databaseSelect.append($dom(
      ['option', {value: '**create-db**'}, 'Create Database']
    ));
    this.databaseSelect.append($dom(
      ['option', {value: '**refresh-list**'}, 'Refresh List']
    ));

    if (this.handler.database) {
      this.databaseSelect.val(this.handler.database);
    }
  }

  renderTablesAndSchemas (data, currentSchema, currentTable) {
    this.tablesList.empty();

    var tableTypes = {
      "VIEW": 'View',
      "BASE TABLE": 'Table',
      "MATERIALIZED VIEW": 'Mat. View',
      "FOREIGN TABLE": "Foreign Table",
      "LOCAL TEMPORARY": "Temporary Table",
      'SEQUENCE': 'Sequence'
    };

    $u.each(data, (schema, tables) => {
      var schemaTree = DOMinate(['li', ['span', schema], {'schema-name': schema}, ['ul$list']]);
      if (schema == 'public') $u(schemaTree[0]).addClass('open');

      $u(schemaTree[0]).find('span').bind('click', () => {
        $u(schemaTree[0]).toggleClass('open');
      });

      // open if selected
      if (currentSchema == schema) {
        $u(schemaTree[0]).addClass('open');
      }

      data[schema].forEach((table) => {
        var tableTitle = tableTypes[table.table_type] || table.table_type;

        var tableNode = $dom(['li', table.table_name, {
          title: tableTitle,
          'table-name': table.table_name,
          'table-type': table.table_type
        }]);

        $u(tableNode).single_double_click((e) => {
          if (e.target.tagName == "INPUT") return;
          e.preventDefault();
          this.handler.tableSelected(schema, table.table_name);
        }, (e) => {
          if (e.target.tagName == "INPUT") return;
          e.preventDefault();
          this.renameTable(tableNode, schema, table.table_name);
        }, 170);

        if (!tableTypes[table.table_type]) {
          try {
            throw new Error(`Unknown table type: ${table.table_type}`);
          } catch (error) {
            errorReporter(error, false);
          }

          table.table_type = "BASE TABLE";
        }

        var actions = {
          'View': () => {
            this.handler.tableSelected(schema, table.table_name);
          }
        };
        if (table.table_type != 'SEQUENCE') {
          actions['separator1'] = 'separator';
          actions['Rename'] = () => {
            this.renameTable(tableNode, schema, table.table_name);
          }
        }

        if (table.table_type == "BASE TABLE") {
          actions['Truncate Table'] = () => {
            this.truncateTable(schema, table.table_name);
          };
        }

        actions[`Show ${tableTitle} SQL`] = () => {
          this.showTableSql(schema, table.table_name, tableTitle);
        };
        if (table.table_type == 'MATERIALIZED VIEW') {
          actions[`Refresh Mat. View`] = () => {
            this.handler.refreshMatView(schema, table.table_name).then(res => {
              $u.alert(`Refreshed materialized view ${table.table_name}`, {info: 'info'});
            });
          };
        }
        if (table.table_type != 'SEQUENCE') {
          actions[`separator2`] = 'separator';
          actions[`Drop ${tableTitle}`] = () => {
            this.handler.dropRelation(schema, table.table_name, (res, error) => {
              if (error) {
                var errorMsg = "" + error.toString();
                if (error.detail) errorMsg += "\n----\n" + error.detail;
                if (error.hint) errorMsg += "\n----\n" + error.hint;
                window.alert(errorMsg);
              } else {
                if (this.handler.currentTable == table.table_name) {
                  this.eraseCurrentContent();
                }
              }
            });
          };
        }

        $u.contextMenu(tableNode, actions);
        tableNode.addEventListener('contextmenu', (event) => {
          this.handler.tableSelected(schema, table.table_name);
        });

        $u(schemaTree.list).append(tableNode);

        if (currentSchema == schema && table.table_name == currentTable) {
          $u(tableNode).addClass('selected');
          this.currentTableNode = $u(tableNode);
        }
      });

      this.tablesList.append(schemaTree[0]);
    });
  }

  setSelected (schema, relation) {
    var node = this.sidebar.find(`[schema-name='${schema}'] [table-name='${relation}']`);

    if (this.currentTableNode) {
      this.currentTableNode.removeClass('selected');
    }
    this.currentTableNode = node;
    this.currentTableNode.addClass('selected');
  }

  reloadStructure () {
    this.handler.fetchTablesAndSchemas();
  }

  clearTablesFilter (options = {show: true}) {
    $u('input.filter-tables').val(null);
    if (options.show !== false) {
      $u('li[table-name]').show();
    }
    this.sidebar.find('.tables-filter').removeClass('has-filter-value');
  }

  filterTables (event) {
    const name = event.target.value;
    //console.log('name', name, !!name);
    if (name) {
      this.sidebar.find('.tables-filter').addClass('has-filter-value');
      $u('li[table-name]').hide().each((i, element) => {
        var tableName = $(element).attr('table-name').toLowerCase();
        if (tableName.includes(name.toLowerCase())) {
          $(element).show();
        }
      });
    } else {
      this.clearTablesFilter();
    }
  }

  renameTable (node, schema, tableName) {
    node = $u(node);
    node.html(`<input value="${tableName}" type="text" class="edit-table-field">`);
    var input = node.find('input');
    input.focus();
    setTimeout(() => { input[0].setSelectionRange(0, 999); }, 20);

    input.bind('keyup', (e) => {
      if (e.keyCode == 27) {
        node.html(tableName);
      }
    });

    var submitted = false;

    $u.listenClickOutside(input, {}, (action) => {
      if (submitted) {
        return;
      }
      if (action == 'click') {
        var newValue = input.val();
        if (newValue != tableName) {
          this.handler.renameTable(schema, tableName, newValue);
          tableName = newValue;
        }
      }
      node.html(tableName);
    });

    input.bind('keypress', (e) => {
      if (e.keyCode == 13) {
        // Enter key pressed
        var newValue = e.target.value;
        node.html(e.target.value);
        this.handler.renameTable(schema, tableName, newValue);
        submitted = true;
      }
    });
  }

  showTab (name) {
    if (this.currentTab) {
      this.topTabs.filter('.' + this.currentTab).removeClass('active');
      this.tabContents.filter('.' + this.currentTab).removeClass('active');
    }

    this.topTabs.filter('.' + name).addClass('active');
    this.tabContents.filter('.' + name).addClass('active');
    this.currentTab = name;
    var currentTabEl = this.tabContents.filter('.' + this.currentTab);

    if (!currentTabEl.attr('unchangeable')) {
      currentTabEl.empty().html('<span class="tab-loader">Getting data ...</span>');
    }

    return this.handler.activateTab(name, true);
  }

  async truncateTable (schema, tableName) {
    var confirmRes = await dialog.showMessageBox({
      type: 'question',
      buttons: ['Truncate', 'Cancel'],
      defaultId: 0,
      message: `Truncate table ${schema}.${tableName}?`,
      detail: `All records will be removed. And table will be locked during this operation`,
      checkboxLabel: "Truncate tables with foreign-key references"
    });

    if (confirmRes.response == 0) {
      try {
        var res = await this.handler.truncateTable(schema, tableName, confirmRes.checkboxChecked);
        dialog.showMessageBox({
          type: "info",
          message: "Table successfully truncated",
          detail: `Complete in ${res.time} ms.`
        });
      } catch (error) {
        var errorMsg = "" + error.toString();

        if (error.detail) errorMsg += "\n----\n" + error.detail;
        if (error.hint) errorMsg += "\n----\n" + error.hint;

        if (!errorMsg.includes(error.query)) errorMsg += "\n----\nSQL: " + error.query;

        dialog.showMessageBox({
          type: "error",
          message: `Error while truncating ${schema}.${tableName}`,
          detail: errorMsg
        });
      }
    }
  }

  setTabMessage (message) {
    if (!this.currentTab) return;

    var currentTabEl = this.tabContents.filter('.' + this.currentTab);

    if (!currentTabEl.attr('unchangeable')) {
      currentTabEl.empty().html('<span class="tab-message">' + message + '</span>');
    }
  }

  setTabContent (tabName, content) {
    var container = this.tabContents.filter('.' + tabName);
    //container.empty().append(content);
    container.removeChildren().fasterAppend(content);
  }

  eraseCurrentContent () {
    if (this.currentTab) {
      this.topTabs.filter('.' + this.currentTab).removeClass('active');
      this.tabContents.filter('.' + this.currentTab).removeClass('active').html("");
    }
  }

  tabContent (tabName) {
    return this.tabContents.filter('.' + tabName);
  }

  newTableDialog () {
    new Dialog.NewTable(this.handler);
  }

  async showTableSql (schema, table, tableTypeTitle) {
    App.startLoading(`Getting ${tableTypeTitle.toLowerCase()} definition sql...`);
    try {
      var source = await this.handler.getTableSql(schema, table)
      new Dialog.ShowSql(`${tableTypeTitle} ${table}`, source);
    } catch (error) {
      $u.alertError("Error getting source", {
        detail: App.humanErrorMessage(error, {showQuery: true})
      })
    } finally {
      App.stopLoading();
    }
  }

  switchToHerokuMode (name, databseUrl) {
    this.content.find('.databases > *').hide();
    var herokuHeader = DOMinate(['div.heroku-mode',
      ['span', "Heroku app:"],
      ['a$name', name]
    ]);

    $u(herokuHeader.name).bind('click', () => {
      new Dialog.HerokuConnection(this, name, databseUrl);
      //window.alertify.alert(databseUrl);
    });

    this.content.find('.databases').append(herokuHeader[0]);
  }

  showConnectionLostIcon () {
    var lostIcon = $dom(['a', '', {title: "Server is disconnected"}]);
    lostIcon.addEventListener('click', (e) => {
      this.handler.showConnectionLostDialog();
    })
    this.content.find('span.connection-lost').empty().append(lostIcon);
  }

  hideConnectionLostIcon () {
    this.content.find('span.connection-lost').empty();
  }
}

global.DbScreenView = DbScreenView;
