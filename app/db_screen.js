class DbScreen {
  /*::
  type: string
  contentTabLimit: number
  contentTabWideLimit: number
  options: any
  connection: Connection
  view: DbScreenView
  currentTab: string
  database: string
  currentTable: string
  currentSchema: string
  table: Model.Table
  contentConditions: string[]
  connectionLostError: Error
  */

  constructor (connection, options) {
    this.type = "db_screen";
    this.contentTabLimit = 200;
    this.contentTabWideLimit = 100;
    this.options = Object.assign({fetchDbList: true}, options)

    this.connection = connection;
    // @ts-ignore
    this.view = new DbScreenView(this);

    this.connection.onDisconnect = (error) => {
      if (this.connectionLostError) {
        this.connectionLostError = error;
      } else {
        this.connectionLostError = error;
        if (App.isFocused && App.currentTab.instance == this) {
          this.showConnectionLostDialog();
        }
      }
      this.view.showConnectionLostIcon();
    };

    this.currentTab = null;

    if (this.options.fetchDbList) this.fetchDbList();

    this.database = this.connection.options.database;
    App.emit('database.changed', this.database);
    this.fetchTablesAndSchemas(() => {
      this.view.showDatabaseContent();
    });

    this.connection.onNotification((message) => {
      window.alertify.alert("Recieve Message:<br>" + JSON.stringify(message));
    });
  }

  // short cut
  query (sql, callback) {
    return this.connection.query(sql, callback);
  }

  omit (event) {
    if (this.view.currentTab == 'users' && (event == 'user.created' || event == 'user.deleted' || event == 'user.updated')) {
      this.usersTabActivate();
    }

    if (this.view.currentTab == 'extensions' && (event == 'extension.installed' || event == 'extension.uninstalled')) {
      this.extensionsTabActivate();
    }

    if (event == 'table.created') {
      //
    }
  }

  listen (event, callback) {
    
  }

  fetchDbList (callback /*:: ?: () => void */) {
    return this.connection.server.listDatabases().then(databases => {
      this.view.renderDbList(databases);
      callback && callback();
    });
  }

  listDatabases (callback) {
    this.connection.server.listDatabases(callback);
  }

  selectDatabase (database, callback /*:: ?: () => void */) {
    if (database == '') database = undefined;

    this.database = database;
    App.emit('database.changed', this.database);

    this.currentTable = null;
    this.currentSchema = null;

    if (database) {
      this.connection.switchDb(this.database, () => {
        this.fetchTablesAndSchemas();
        if (typeof callback == 'function') callback();
        if (['extensions', 'procedures'].includes(this.view.currentTab)) {
          this.view.showTab(this.view.currentTab);
        }
      });
    } else {
      this.view.hideDatabaseContent();
      this.connection.close();
    }
  }

  // Public API
  setDatabase (database, callback) {
    this.view.setDabase(database, callback);
  }

  async fetchTablesAndSchemas (callback /*:: ?: (data: any) => void */) {
    App.startLoading("Getting tables list...");

    try {
      var data = await this.connection.tablesAndSchemas();
      var matViews = await this.connection.mapViewsAsTables();
      var sequences = await this.connection.findNonSerialSequences();

      Object.forEach(matViews, (schema, views) => {
        if (!data[schema]) data[schema] = [];
        views.forEach((view) => {
          data[schema].push(view);
        });
      });

      Object.forEach(sequences, (schema, views) => {
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

      this.view.renderTablesAndSchemas(data, this.currentSchema, this.currentTable);
      callback && callback(data);
    } catch (error) {
      $u.alertSqlError("Can not load tables", error);
      errorReporter(error, false);
    } finally {
      App.stopLoading();
    }
  }

  tableSelected (schema, tableName, showTab /*:: ?: string */) {
    if (this.currentSchema == schema && this.currentTable == tableName) {
      return;
    }
    this.currentSchema = schema;
    this.currentTable = tableName;

    App.emit('table.changed', this.currentSchema, this.currentTable);

    this.table = new Model.Table(this.currentSchema, this.currentTable);

    this.view.setSelected(schema, tableName);

    if (showTab) {
      return this.view.showTab(showTab);
    } else if (['structure', 'content', 'info'].includes(this.view.currentTab)) {
      return this.view.showTab(this.view.currentTab);
    } else {
      return this.view.showTab('structure');
    }
  }

  activateTab (tabName, force) {
    //console.log(tabName + 'TabActivate', typeof this[tabName + 'TabActivate']);

    if (this.currentTab == tabName && !force) {
      return;
    }

    if (this[tabName + 'TabActivate']) {
      this.currentTab = tabName;
      App.emit('dbtab.changed', this.currentTab);
      return this[tabName + 'TabActivate']();
    }
  }

  async extensionsTabActivate () {
    App.startLoading(`Getting extensions list`);
    try {
      var result = await this.connection.getExtensions()
      this.view.extensionsPane.renderTab(result.rows);
      this.currentTab = 'extensions';
    } catch (error) {
      this.view.extensionsPane.renderError(error);
      this.currentTab = 'extensions';
    } finally {
      App.stopLoading();
    }
  }

  installExtension (extension, callback) {
    App.startLoading(`Installing extension ${extension}`);
    this.connection.installExtension(extension, (data, error) => {
      App.stopLoading();
      if (!error) this.omit('extension.installed');
      callback(data, error);
    });
  }

  uninstallExtension (extension, callback) {
    App.startLoading(`Removing extension ${extension}`);
    this.connection.uninstallExtension(extension, (data, error) => {
      App.stopLoading();
      if (!error) this.omit('extension.uninstalled');
      callback(data, error);
    });
  }

  async openContentTabWithFilter (schema, table, field, value) {
    this.contentConditions = [Pane.Content.filterSql(field, 'eq', value)];
    var res = await this.tableSelected(schema, table, 'content');

    delete this.contentConditions;
    this.view.contentPane.setFilter(field, 'eq', value);
    this.view.clearTablesFilter();
  }

  async contentTabActivate () {
    var sTime = Date.now();
    if (!this.currentTable) {
      this.view.setTabMessage("Please select table or view");
      return;
    }

    App.startLoading("Fetching data ...", undefined, {
      cancel: () => {
        App.stopRunningQuery();
      }
    });

    try {
      var columnTypes = await this.table.getColumnTypes();
      var hasOid = !!columnTypes.oid;
      var extraColumns = [];
      Object.forEach(columnTypes, (key, col) => {
        if (/geometry\(Point\)/.test(col.data_type)) {
          extraColumns.push(`ST_AsText(${key}) as ${key}`);
        }
      });
      var rowsCount = Object.keys(columnTypes).length < 20 ? this.contentTabLimit : this.contentTabWideLimit;
      var queryOptions /*:: : Table_getRows_Options */ = {
        with_oid: hasOid,
        extraColumns: extraColumns,
        conditions: this.contentConditions
      };
      if (columnTypes.id && (columnTypes.id.column_default || '').match(/^nextval\(/)) {
        queryOptions.sortColumn = 'id';
      }
      var data = await this.table.getRows(0, rowsCount, queryOptions);
      data.relations = await this.table.getRelations()

      this.currentTab = 'content';

      await this.view.contentPane.renderTab(data, columnTypes, {
        pageLimit: rowsCount,
        queryOptions: queryOptions
      });
      return 'done';
    } catch (error) {
      $u.alertSqlError("Can not load content", error);
      this.view.contentPane.renderTab(null, null, {error: error});
      this.currentTab = 'content';
      return 'error';
    } finally {
      App.stopLoading();
      console.log("contentTabActivate " + (Date.now() - sTime) + "ms");
    }
  }

  queryTabActivate () {
    this.view.queryPane.renderTab();
    this.currentTab = 'query';
  }

  async usersTabActivate () {
    App.startLoading(`Getting users list...`);
    try {
      var users = await Model.User.findAll();
      this.view.usersPane.renderTab(users);
      this.currentTab = 'users';
    } catch (error) {
      this.view.usersPane.renderError(error);
      this.currentTab = 'users';
    } finally {
      App.stopLoading();
    }
  }

  async createUser (data) {
    if (data.admin == '1') {
      delete data.admin;
      data.superuser = true;
    }

    var result = await Model.User.create(data);
    this.omit('user.created');
    return result;
  }

  async updateUser (username, data) {
    if (data.admin == '1') {
      delete data.admin;
      data.superuser = true;
    }

    var result = await new Model.User(username).update(data);
    this.omit('user.updated');
    return result;
  }

  async deleteUser (username) {
    var result = await Model.User.drop(username);
    this.omit('user.deleted');
    return result;
  }

  async createDatabase (data) {
    await this.connection.switchDb(Connection.defaultDatabaseName);
    var res = await this.connection.server.createDatabase(data.dbname, data.template, data.encoding);
    await this.fetchDbList();
    this.view.databaseSelect.val(data.dbname).change();

    return res;
  }

  async dropDatabaseDialog () {
    var msg = `Delete database ${this.database}?`;
    var result = await $u.confirm(msg, {
      detail: "It will delete all tables in it",
      button: "Drop Database",
      defaultId: 1
    });

    if (result) {
      this.dropDatabase();
    }
  }

  async dropDatabase () {
    App.startLoading("Deleting database...");
    try {
      await this.connection.server.dropDatabase(this.database);
      this.database = undefined;
      this.view.hideDatabaseContent();
      this.fetchDbList();
      App.emit('database.changed', this.database);
    } catch (error) {
      window.alertify.alert(error.message);
    }
    App.stopLoading();
  }

  renameDatabaseDialog (defaultValue = null) {
    var msg = "Renaming database '" + this.database + "'?";
    window.alertify.prompt(msg, (result, newName) => {
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
  }

  async renameDatabase (databaseNewName) {
    App.startLoading("Renaming database...");
    try {
      await this.connection.server.renameDatabase(this.database, databaseNewName);
      this.database = databaseNewName;
      this.fetchDbList();
      App.emit('database.changed', this.database);
    } catch (error) {
      window.alertify.alert(error.message);
    }
    App.stopLoading();
  }

  async createTable (data) {
    App.startLoading(`Creating table table ${data.name}`);
    try {
      await Model.Table.create(data.tablespace, data.name);
      this.omit('table.created');
      this.fetchTablesAndSchemas(tables => {
        this.tableSelected(data.tablespace, data.name, 'structure');
      });
    } catch (error) {
      $u.alertSqlError("Can not create table", error);
      errorReporter(error, false);
    } finally {
      App.stopLoading();
    }
  }

  _relationTitle (type) {
    return {
      "VIEW": 'view',
      "BASE TABLE": 'table',
      "MATERIALIZED VIEW": 'materialized view',
      'FOREIGN TABLE': 'foreign table'
    }[type] || type;
  }

  async dropRelation (schema, tableName, callback) {
    var table = new Model.Table(schema, tableName);

    var type = await table.getTableType();
    var tableTitle = this._relationTitle(type);

    var message = `Delete ${tableTitle} ${schema}.${tableName}?`;
    if (await $u.confirm(message)) {
      await table.remove();
      this.omit('table.deleted');
      this.fetchTablesAndSchemas();
    }
  }

  async refreshMatView (schema, tableName) {
    var table = new Model.Table(schema, tableName);

    App.startLoading(`Refreshing ${schema}.${tableName}...`);
    var res = await table.refreshMatView();
    App.stopLoading();

    return res;
  }

  async renameTable (schema, tableName, newName) {
    if (tableName == newName) {
      console.log("Try rename table '" + tableName + "' -> '" + newName + "', canceled, same value");
      return;
    }

    var table = new Model.Table(schema, tableName);

    var type = await table.getTableType();
    var tableTitle = this._relationTitle(type);

    App.startLoading(`Renaming ${tableTitle} ${tableName} to ${newName}`);

    var result = await table.rename(newName);

    App.stopLoading();

    if (this.currentTable == tableName) {
      if (['structure', 'content', 'info'].includes(this.view.currentTab)) {
        this.tableSelected(this.currentSchema, newName);
      } else {
        this.currentTable = newName;
        this.table = new Model.Table(this.currentSchema, this.currentTable);
      }
    }
    this.omit('table.renamed');
    this.fetchTablesAndSchemas();

    return result;
  }

  async structureTabActivate () {
    if (!this.currentTable) {
      this.view.setTabMessage("Please select table or view");
      return;
    }
    App.startLoading("Getting table structure...");

    try {
      var sequenceInfo = await this.table.sequenceInfo();
      if (sequenceInfo) {
        this.view.structurePane.renderTab(rows, [], false, {sequenceInfo: sequenceInfo});
        App.stopLoading();
        return;
      }
    } catch (error) {
      errorReporter(error, false);
    }

    try {
      var isMatView = await this.table.isSequence();
    } catch (error) {
      errorReporter(error, false);
    }

    try {
      var rows = await this.table.getStructure();
    } catch (error) {
      var columnsError = error;
      errorReporter(error, false);
    }

    try {
      var indexes = await Model.Index.list(this.table);
    } catch (error) {
      var indexesError = error;
      if (error instanceof App.UserError) {
        $u.alertError(error);
      } else {
        errorReporter(error, false);
      }
    }

    try {
      var constraints = await this.table.getConstraints();
    } catch (error) {
      var constraintsError = error;
      errorReporter(error, false);
    }

    this.view.structurePane.renderTab(rows, indexes, constraints, {
      isMatView: isMatView,
      columnsError: columnsError,
      indexesError: indexesError,
      constraintsError: constraintsError
    });
    App.stopLoading();
  }

  proceduresTabActivate () {
    this.view.proceduresPane.renderTab(() => {
      this.currentTab = 'procedures';
    });
  }

  async addColumn (data) {
    App.startLoading(`Adding column ${data.name}`);
    var column = new Model.Column({
      table: this.table,
      name: data.name,
      type: data.type,
      max_length: data.max_length,
      default_value: data.default_value,
      allow_null: data.allow_null
    });

    console.log(column);

    try {
      await column.create();
      this.structureTabActivate();
    } finally {
      App.stopLoading();
    }
  }

  async updateColumn (columnObj, data) {
    App.startLoading(`Updating column ${columnObj.data.column_name}`);

    try {
      var res = await columnObj.update(data);
      if (res) {
        this.structureTabActivate();
      }
      return res;
    } finally {
      App.stopLoading();
    }
  }

  async deleteColumn (columnName) {
    App.startLoading(`Deleting column ${columnName}`);
    var column = new Model.Column(columnName, {table: this.table});
    try {
      await column.drop();
      this.structureTabActivate();
    } finally {
      App.stopLoading();
    }
  }

  async addIndex (data) {
    App.startLoading(`Adding index ${data.name}`);

    try {
      var result = await Model.Index.create(this.table, data.name, {
        uniq: data.uniq,
        columns: data.columns,
        method: data.method
      })
      this.structureTabActivate()
      return result;
    } finally {
      App.stopLoading();
    }
  }

  async deleteIndex (indexName) {
    App.startLoading(`Deleting index ${indexName}`);

    try {
      var index = new Model.Index(indexName, this.table);
      await index.drop()
      this.structureTabActivate()
    } finally {
      App.stopLoading();
    }
  }

  deleteConstraint (constraintName, callback) {
    App.startLoading(`Deleting constraint ${constraintName}`);
    this.table.dropConstraint(constraintName, (result, error) => {
      App.stopLoading();
      if (!error) this.structureTabActivate();
      callback(result, error);
    });
  }

  getTableSql (schema, table) {
    return new Model.Table(schema, table).getSourceSql();
  }

  infoTabActivate () {
    if (!this.currentTable) {
      this.view.setTabMessage("Please select table or view");
      return;
    }

    var table = this.tableObj();

    this.view.setTabMessage("Getting table information ...");

    App.startLoading("Getting table info...");

    table.getSourceSql((code, dumpError) => {
      this.view.infoPane.updateSource(code, dumpError);
      this.view.infoPane.renderTab();
      App.stopLoading();
    });

    table.diskSummary().then(result => {
      this.view.infoPane.updateSummary(result);
      this.view.infoPane.renderTab();
      App.stopLoading();
    }).catch(error => {
      console.error(error);
      this.view.infoPane.updateSummary({}, error);
      this.view.infoPane.renderTab();
      App.stopLoading();
    });

    this.currentTab = 'info';
  }

  // TODO: add caching
  tableObj () {
    return new Model.Table(this.currentSchema, this.currentTable);
  }

  switchToHerokuMode (appName, dbUrl) {
    this.view.switchToHerokuMode(appName, dbUrl);
  }

  destroy () {
    this.connection.close();
  }

  reconnect (callback /*:: ?: (success: boolean) => void */) {
    this.connection.reconnect((success, error) => {
      if (success) {
        window.alertify.alert('Reconnected!');
        if (callback) callback(true);
        this.view.hideConnectionLostIcon();
        delete this.connectionLostError;
      } else {
        window.alertify.alert('Connection error.<br>' + (error.message || error));
        if (callback) callback(false);
      }
    });
  }

  async truncateTable (schema, table, cascade) {
    App.startLoading(`Truncating ${table}`);
    try {
      var result = await (new Model.Table(schema, table).truncate(cascade));
      if (['structure', 'content', 'info'].includes(this.view.currentTab)) {
        this.view.showTab(this.view.currentTab);
      }
      return result;
    } finally {
      App.stopLoading();
    }
  }

  async loadForeignRows (schema, table, column, value) /*: Promise<any[]> */ {
    try {
      App.startLoading(`Loading related rows`);
      var rows = await new Model.Table(schema, table).getRowsSimple(column, value);
      return rows;
    } finally {
      App.stopLoading();
    }
  }

  async showConnectionLostDialog () {
    var dialog = electron.remote.dialog;
    var message = this.connectionLostError.message.replace(/\n\s+/g, "\n");
    var res = await dialog.showMessageBox({
      type: "error",
      message: "Server Connection Error",
      detail: message,
      buttons: ["Reconnect", "Do Nothing"],
      defaultId: 0,
      cancelId: 1,
    });

    if (res.response == 0) {
      this.reconnect();
    }
  }
}

global.DbScreen = DbScreen;
