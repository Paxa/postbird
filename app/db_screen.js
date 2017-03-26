global.DbScreen = jClass.extend({
  type: "db_screen",

  options: {
    fetchDbList: true
  },

  init: function(connection, options) {
    node.util._extend(this.options, options);

    this.connection = connection;
    this.view = new DbScreenView(this);

    if (this.options.fetchDbList) this.fetchDbList();

    this.database = this.connection.options.database;
    App.emit('database.changed', this.database);
    this.fetchTablesAndSchemas(() => {
      this.view.showDatabaseContent();
    });

    this.connection.onNotification((message) => {
      window.alertify.alert("Recieve Message:<br>" + JSON.stringify(message));
    });
  },

  // short cut
  query: function(sql, callback){
    return this.connection.query(sql, callback);
  },

  omit: function (event) {
    if (this.view.currentTab == 'users' && (event == 'user.created' || event == 'user.deleted')) {
      this.usersTabActivate();
    }

    if (this.view.currentTab == 'extensions' && (event == 'extension.installed' || event == 'extension.uninstalled')) {
      this.extensionsTabActivate();
    }

    if (event == 'table.created') {
      //
    }
  },

  listen: function (event, callback) {
    
  },

  fetchDbList: function (callback) {
    this.connection.listDatabases((databases) => {
      this.view.renderDbList(databases);
      callback && callback();
    });
  },

  listDatabases: function(callback){
    this.connection.listDatabases(callback);
  },

  selectDatabase: function (database, callback) {
    if (database == '') database = undefined;

    this.database = database;
    App.emit('database.changed', this.database);

    this.currentTable = null;
    this.currentSchema = null;

    if (database) {
      this.connection.switchDb(this.database, () => {
        this.fetchTablesAndSchemas();
        if (typeof callback == 'function') callback();
      });
    } else {
      this.view.hideDatabaseContent();
      this.connection.close();
    }
  },

  // Public API
  setDatabase: function (database, callback) {
    this.view.setDabase(database, callback);
  },

  fetchTablesAndSchemas: function (callback) {
    App.startLoading("Getting tables list...");
    this.connection.tablesAndSchemas((data) => {
      this.connection.mapViewsAsTables((matViews) => {
        // join tables with views
        Object.forEach(matViews, (schema, views) => {
          if (!data[schema]) data[schema] = [];
          views.forEach((view) => {
            data[schema].push(view);
          });
        });
        // sort everything again
        Object.forEach(data, (schema, tables) => {
          data[schema] = tables.sort((a, b) => {
            if (a.table_name > b.table_name) return 1;
            if (a.table_name < b.table_name) return -1;
            return 0;
          })
        });
        App.stopLoading();
        this.view.renderTablesAndSchemas(data, this.currentSchema, this.currentTable);
        callback && callback(data);
      });
    });
  },

  tableSelected: function(schema, tableName, node) {
    if (this.currentSchema == schema && this.currentTable == tableName) {
      return;
    }
    this.currentSchema = schema;
    this.currentTable = tableName;

    App.emit('table.changed', this.currentSchema, this.currentTable);

    this.table = Model.Table(this.currentSchema, this.currentTable);

    if (this.currentTableNode) this.currentTableNode.removeClass('selected');
    this.currentTableNode = $u(node);
    this.currentTableNode.addClass('selected');

    this.view.showTab('structure');
  },

  activateTab: function (tabName, force) {
    console.log(tabName + 'TabActivate', typeof this[tabName + 'TabActivate']);

    if (this.currentTab == tabName && !force) {
      return;
    }

    if (this[tabName + 'TabActivate']) {
      this.currentTab = tabName;
      App.emit('dbtab.changed', this.currentTab);
      this[tabName + 'TabActivate']();
    }
  },

  extensionsTabActivate: function () {
    this.connection.getExtensions((rows) => {
      this.view.extensions.renderTab(rows);
    });
  },

  installExtension: function (extension, callback) {
    App.startLoading(`Installing extension ${extension}`);
    this.connection.installExtension(extension, (data, error) => {
      App.stopLoading();
      if (!error) this.omit('extension.installed');
      callback(data, error);
    });
  },

  uninstallExtension: function (extension, callback) {
    App.startLoading(`Removing extension ${extension}`);
    this.connection.uninstallExtension(extension, (data, error) => {
      App.stopLoading();
      if (!error) this.omit('extension.uninstalled');
      callback(data, error);
    });
  },

  contentTabLimit: 300,

  contentTabActivate: function() {
    if (!this.currentTable) {
      this.view.setTabMessage("Please select table or view");
      return;
    }

    App.startLoading("Fetching data ...", {
      cancel: function () {
        App.stopRunningQuery();
      }
    });
    this.table.getColumnTypes((columnTypes, error2) => {
      var hasOid = !!columnTypes.oid;
      var extraColumns = [];
      Object.forEach(columnTypes, (key, col) => {
        if (/geometry\(Point\)/.test(col.data_type)) {
          extraColumns.push(`ST_AsText(${key}) as ${key}`);
        }
      });
      this.table.getRows(0, this.contentTabLimit, {with_oid: hasOid, extraColumns: extraColumns}, (data, error) => {
        App.stopLoading();
        this.view.contents.renderTab(data, columnTypes, error || error2);
      });
    });
  },

  usersTabActivate: function () {
    Model.User.findAll((rows, error) => {
      this.view.users.renderTab(rows);
    });
  },

  queryTabActivate: function () {
    this.view.query.renderTab();
  },

  createUser: function(data, callback) {
    if (data.admin == '1') {
      delete data.admin;
      data.superuser = true;
    }

    Model.User.create(data, (data, error) => {
      if (!error) {
        this.omit('user.created')
      }
      callback(data, error);
    });
  },

  deleteUser: function(username, callback) {
    App.startLoading(`Deleting user ${username}`);
    Model.User.drop(username, (data, error) => {
      App.stopLoading();
      if (error) {
        window.alert(error);
      } else {
        this.omit('user.deleted')
      }
      callback && callback(data, error);
    });
  },

  createDatabase: function (data, callback) {
    this.connection.switchDb(this.connection.defaultDatabaseName, () => {
      this.connection.createDatabase(data.dbname, data.template, data.encoding, (res, error) => {
        if (!error) {
          this.fetchDbList(() => {
            this.view.databaseSelect.val(data.dbname).change();
            //this.selectDatabase(data.dbname);
          });
        }
        callback(res, error);
      });
    });
  },

  dropDatabaseDialog: function () {
    var msg = "Delete database and all tables in it?";
    var dialog = window.alertify.confirm(msg, (result) => {
      if (result) {
        this.dropDatabase();
      }
    });
  },

  dropDatabase: function () {
    App.startLoading("Deleting database...");
    this.connection.dropDatabase(this.database, (result, error) => {
      App.stopLoading();
      if (error) {
        window.alertify.alert(error.message);
      } else {
        this.database = undefined;
        this.view.hideDatabaseContent();
        this.fetchDbList();
        App.emit('database.changed', this.database);
      }
    });
  },

  renameDatabaseDialog: function (defaultValue) {
    var msg = "Renaming database '" + this.database + "'?";
    var dialog = window.alertify.prompt(msg, (result, newName) => {
      if (result) {
        if (newName && newName.trim() != "" && newName != this.database) {
          this.renameDatabase(newName);
        } else {
          window.alert('Please fill database name');
          this.renameDatabaseDialog(newName);
          setTimeout(() => {
            $u('#alertify-text').focus();
          }, 200);
        }
      }
    }, defaultValue || this.database);
  },

  renameDatabase: function (databaseNewName) {
    App.startLoading("Renaming database...");
    this.connection.renameDatabase(this.database, databaseNewName, (result, error) => {
      App.stopLoading();
      if (error) {
        window.alertify.alert(error.message);
      } else {
        this.database = databaseNewName;
        this.fetchDbList();
        App.emit('database.changed', this.database);
      }
    });
  },

  createTable: function (data, callback) {
    App.startLoading(`Creating table table ${data.name}`);
    Model.Table.create(data.tablespace, data.name, (table, res, error) => {
      App.stopLoading();
      if (!error) {
        this.omit('table.created');
        this.fetchTablesAndSchemas((tables) => {
          var tableElement = this.view.sidebar.find('[schema-name=' + data.tablespace + '] ' +
                                                      '[table-name=' + data.name + ']')[0];
          this.tableSelected(data.tablespace, data.name, tableElement);
        });
      }
      callback(res, error);
    });
  },

  dropTable: function (schema, table, callback) {
    window.alertify.confirm("Delete table " + schema + '.' + table + "?", (agreed) => {
      if (!agreed) return;
      App.startLoading(`Dropping table ${table}`);
      Model.Table(schema, table).remove((res, error) => {
        App.stopLoading();
        this.omit('table.deleted');
        this.fetchTablesAndSchemas();
        callback && callback(res, error);
      });
    });
  },

  dropView: function (schema, table, callback) {
    window.alertify.confirm("Delete view " + schema + '.' + table + "?", (agreed) => {
      if (!agreed) return;
      App.startLoading(`Dropping view ${table}`);
      Model.Table(schema, table).removeView((success, error) => {
        App.stopLoading();
        if (success) {
          this.omit('table.deleted');
          this.fetchTablesAndSchemas();
        }
        callback && callback(success, error);
      });
    });
  },

  dropForeignTable: function (schema, table, callback) {
    window.alertify.confirm("Delete foreign " + schema + '.' + table + "?", (agreed) => {
      if (!agreed) return;
      App.startLoading(`Dropping foreign table ${table}`);
      Model.Table(schema, table).dropFereign((success, error) => {
        App.stopLoading();
        if (success) {
          this.omit('table.deleted');
          this.fetchTablesAndSchemas();
        }
        callback && callback(success, error);
      });
    });
  },

  renameTable: function (schema, tableName, newName, callback) {
    if (tableName == newName) {
      console.log("Try rename table '" + tableName + "' -> '" + newName + "', canceled, same value");
      callback && callback();
      return;
    }

    App.startLoading(`Renaming table ${tableName} to ${newName}`);
    Model.Table(schema, tableName).rename(newName, (res, error) => {
      App.stopLoading();
      if (this.currentTable == tableName) {
        this.currentTable = newName;
      }
      this.omit('table.renamed');
      this.fetchTablesAndSchemas();
      callback && callback(res, error);
    });
  },

  structureTabActivate: function () {
    if (!this.currentTable) {
      this.view.setTabMessage("Please select table or view");
      return;
    }
    App.startLoading("Getting table structure...");

    this.table.isMatView((isMatView) => {
      Model.Table(this.currentSchema, this.currentTable).getStructure((rows) => {
        this.table.describe((indexes, error) => {
          if (error) console.error(error);
          this.table.getConstraints((constraints, error2) => {
            if (error2) console.error(error2);
            this.view.structure.renderTab(rows, indexes, constraints, isMatView);
            App.stopLoading();
          });
        });
      });
    });
  },

  proceduresTabActivate: function() {
    this.view.procedures.renderTab();
  },

  addColumn: function (data, callback) {
    App.startLoading(`Adding column ${data.name}`);
    this.table.addColumn(data.name, data.type, data.max_length, data.default_value, data.is_null, (result, error) => {
      App.stopLoading();
      if (!error) {
        this.structureTabActivate();
      }
      callback(result, error);
    });
  },

  editColumn: function (columnObj, data, callback) {
    App.startLoading(`Updating column ${columnObj.data.column_name}`);
    columnObj.update(data, (result, error) => {
      App.stopLoading();
      if (!error) {
        this.structureTabActivate();
      }
      callback(result, error);
    });
  },

  deleteColumn: function (columnName, callback) {
    App.startLoading(`Deleting column ${columnName}`);
    this.table.dropColumn(columnName, (result, error) => {
      App.stopLoading();
      if (!error) {
        this.structureTabActivate();
      }
      console.log(result, error);
      callback(result, error);
    });
  },

  addIndex: function (data, callback) {
    App.startLoading(`Adding index ${data.name}`);
    this.table.addIndex(data.name, data.uniq, data.columns, data.method, (result, error) => {
      App.stopLoading();
      if (!error) this.structureTabActivate();
      callback(result, error);
    });
  },

  deleteIndex: function (indexName, callback) {
    App.startLoading(`Deleting index ${indexName}`);
    this.table.dropIndex(indexName, (result, error) => {
      App.stopLoading();
      if (!error) this.structureTabActivate();
      callback(result, error);
    });
  },

  deleteConstraint: function (constraintName, callback) {
    App.startLoading(`Deleting constraint ${constraintName}`);
    this.table.dropConstraint(constraintName, (result, error) => {
      App.stopLoading();
      if (!error) this.structureTabActivate();
      callback(result, error);
    });
  },

  getTableSql: function (schema, table, callback) {
    Model.Table(schema, table).getSourceSql((source) => {
      callback(source);
    });
  },

  infoTabActivate: function () {
    if (!this.currentTable) {
      this.view.setTabMessage("Please select table or view");
      return;
    }

    var table = this.tableObj();
    var _this = this;

    this.view.setTabMessage("Getting table information ...");

    App.startLoading("Getting table info...");
    table.getSourceSql((code, dumpError) => {
      table.diskSummary((relType, estimateCount, diskUsage) => {
        if (dumpError) {
          window.alert("Running pg_dump failed:\n" + dumpError);
        }
        App.stopLoading();
        _this.view.info.renderTab(code, relType, estimateCount, diskUsage);
      });
    });
  },

  // TODO: add caching
  tableObj: function() {
    return Model.Table(this.currentSchema, this.currentTable);
  },

  switchToHerokuMode: function (appName, dbUrl) {
    this.view.switchToHerokuMode(appName, dbUrl);
  },

  destroy: function () {
    this.connection.close();
  },

  reconnect: function (callback) {
    this.connection.reconnect((success, error) => {
      if (success) {
        window.alertify.alert('Reconnected!');
        if (callback) callback(true);
      } else {
        window.alertify.alert('Connection error.<br>' + (error.message || error));
        if (callback) callback(false);
      }
    });
  },

  truncateTable(schema, table, callback) {
    App.startLoading(`Truncating ${table}`);
    Model.Table(schema, table).truncate((result, error) => {
      App.stopLoading();
      callback(result, error);
    });
  }
});

global.Panes = {};
