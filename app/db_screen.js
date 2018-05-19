class DbScreen {
  /*::
  type: string
  contentTabLimit: number
  options: any
  connection: Connection
  view: any // TODO
  currentTab: string
  database: string
  currentTable: string
  currentSchema: string
  table: Model.Table
  */

  constructor (connection, options) {
    this.type = "db_screen";
    this.contentTabLimit = 200;
    this.options = Object.assign({fetchDbList: true}, options)

    this.connection = connection;
    // @ts-ignore
    this.view = new DbScreenView(this);

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

  selectDatabase (database, callback) {
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

  fetchTablesAndSchemas (callback /*:: ?: (data: any) => void */) {
    App.startLoading("Getting tables list...");
    return this.connection.tablesAndSchemas((data) => {
      return this.connection.mapViewsAsTables((matViews) => {
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
  }

  tableSelected (schema, tableName, showTab) {
    if (this.currentSchema == schema && this.currentTable == tableName) {
      return;
    }
    this.currentSchema = schema;
    this.currentTable = tableName;

    App.emit('table.changed', this.currentSchema, this.currentTable);

    this.table = new Model.Table(this.currentSchema, this.currentTable);

    this.view.setSelected(schema, tableName);

    if (showTab) {
      this.view.showTab(showTab);
    } else if (['structure', 'content', 'info'].includes(this.view.currentTab)) {
      this.view.showTab(this.view.currentTab);
    } else {
      this.view.showTab('structure');
    }
  }

  activateTab (tabName, force) {
    console.log(tabName + 'TabActivate', typeof this[tabName + 'TabActivate']);

    if (this.currentTab == tabName && !force) {
      return;
    }

    if (this[tabName + 'TabActivate']) {
      this.currentTab = tabName;
      App.emit('dbtab.changed', this.currentTab);
      this[tabName + 'TabActivate']();
    }
  }

  extensionsTabActivate () {
    this.connection.getExtensions((rows) => {
      this.view.extensionsPane.renderTab(rows);
      this.currentTab = 'extensions';
    });
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

  async contentTabActivate () {
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
      var data = await this.table.getRows(0, this.contentTabLimit, {with_oid: hasOid, extraColumns: extraColumns});
      this.view.contentPane.renderTab(data, columnTypes);
      this.currentTab = 'content';
    } catch (error) {
      this.view.contentPane.renderTab(null, null, error);
      this.currentTab = 'content';
    } finally {
      App.stopLoading();
    }
  }

  queryTabActivate () {
    this.view.queryPane.renderTab();
    this.currentTab = 'query';
  }

  async usersTabActivate () {
    var users = await Model.User.findAll();
    this.view.usersPane.renderTab(users);
    this.currentTab = 'users';
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

  async createDatabase (data, callback) {
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

  renameDatabaseDialog (defaultValue) {
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

  async createTable (data, callback) {
    App.startLoading(`Creating table table ${data.name}`);
    try {
      await Model.Table.create(data.tablespace, data.name);
      this.omit('table.created');
      this.fetchTablesAndSchemas(tables => {
        this.tableSelected(data.tablespace, data.name, 'structure');
      });
    } catch (error) {
      
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
      this.currentTable = newName;
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
      var isMatView = await this.table.isMatView();
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
      errorReporter(error, false);
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

  async addColumn (data, callback) {
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

  async updateColumn (columnObj, data, callback) {
    App.startLoading(`Updating column ${columnObj.data.column_name}`);

    try {
      await columnObj.update(data);
      this.structureTabActivate();
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

  async addIndex (data, callback) {
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

  async deleteIndex (indexName, callback) {
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

  getTableSql (schema, table, callback) {
    new Model.Table(schema, table).getSourceSql((source) => {
      callback(source);
    });
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
      table.diskSummary().then(result => {
        if (dumpError) {
          //window.alert("Running pg_dump failed:\n" + dumpError);
          //global.errorReporter(dumpError, false);
        }
        this.view.infoPane.renderTab(
          {source: code, error: dumpError},
          result.type, result.estimateCount, result.diskUsage
        );
        App.stopLoading();
        this.currentTab = 'info';
      }).catch(error => {
        global.errorReporter(error, false);
        this.view.infoPane.renderTab(
          {source: code, error: dumpError},
          'error getting talbe info', '', ''
        );
        App.stopLoading();
        this.currentTab = 'info';
      });
    });
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

  reconnect (callback) {
    this.connection.reconnect((success, error) => {
      if (success) {
        window.alertify.alert('Reconnected!');
        if (callback) callback(true);
      } else {
        window.alertify.alert('Connection error.<br>' + (error.message || error));
        if (callback) callback(false);
      }
    });
  }

  truncateTable (schema, table, cascade, callback) {
    App.startLoading(`Truncating ${table}`);
    new Model.Table(schema, table).truncate(cascade, (result, error) => {
      App.stopLoading();
      callback(result, error);
    });
  }
}

global.DbScreen = DbScreen;
