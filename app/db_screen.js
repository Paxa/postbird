global.DbScreen = jClass.extend({

  init: function(connection, callback) {
    this.connection = connection;
    this.view = new DbScreenView(this);
    this.fetchDbList();
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
  },

  listen: function (event, callback) {
    
  },

  fetchDbList: function (callback) {
    this.connection.listDatabases(function(databases) {
      this.view.renderDbList(databases);
      callback && callback();
    }.bind(this));
  },

  selectDatabase: function (database) {
    this.database = database;
    this.connection.switchDb(this.database, function () {
      this.connection.tablesAndSchemas(function(data) {
        this.view.renderTablesAndSchemas(data);
      }.bind(this));
    }.bind(this));
  },

  tableSelected: function(schema, tableName, node) {
    this.currentSchema = schema;
    this.currentTable = tableName;

    if (this.currentTableNode) this.currentTableNode.removeClass('selected');
    this.currentTableNode = $u(node);
    this.currentTableNode.addClass('selected');

    this.fetchTableStructure(schema, tableName);
    this.view.showTab('structure');
  },

  fetchTableStructure: function(schema, table) {
    this.connection.tableStructure(schema, table, function (data) {
      this.view.renderTableStructureTab(data.rows);
    }.bind(this));
  },

  extensionsTabActivate: function () {
    this.connection.getExtensions(function(rows) {
      this.view.extensions.renderTab(rows);
    }.bind(this));
  },

  installExtension: function (extension, callback) {
    this.connection.installExtension(extension, function (data, error) {
      if (!error) this.omit('extension.installed');
      callback(data, error);
    }.bind(this));
  },

  uninstallExtension: function (extension, callback) {
    this.connection.uninstallExtension(extension, function (data, error) {
      if (!error) this.omit('extension.uninstalled');
      callback(data, error);
    }.bind(this));
  },

  contentTabActivate: function() {
    this.connection.getTableContent(this.currentSchema, this.currentTable, function(data) {
      this.connection.tableStructure(this.currentSchema, this.currentTable, function (sdata) {
        data.fields.forEach(function(feild) {
          sdata.rows.forEach(function(r) {
            if (r.column_name == feild.name) feild.real_format = r.udt_name;
          });
        });
        this.view.renderContentTab(data);
      }.bind(this));
    }.bind(this));
  },

  usersTabActivate: function () {
    this.connection.getUsers(function(rows) {
      this.view.users.renderTab(rows);
    }.bind(this));
  },

  queryTabActivate: function () {
    this.view.query.renderTab();
  },

  createUser: function(data, callback) {
    if (data.admin == '1') {
      delete data.admin;
      data.superuser = true;
    }

    this.connection.createUser(data, function(data, error) {
      if (!error) {
        this.omit('user.created')
      }
      callback(data, error);
    }.bind(this));
  },

  deleteUser: function(username, callback) {
    this.connection.deleteUser(username, function(data, error) {
      if (!error) {
        this.omit('user.deleted')
      }
      callback && callback(data, error);
    }.bind(this));
  },

  createDatabase: function (data, callback) {
    this.connection.createDatabase(data.dbname, data.template, data.encoding, function (res, error) {
      if (!error) {
        this.fetchDbList(function() {
          this.view.databaseSelect.val(data.dbname).change();
          //this.selectDatabase(data.dbname);
        }.bind(this));
      }
      callback(res, error);
    }.bind(this));
  }
});

global.Panes = {};

/*

function renderMainScreen () {
  renderPage('main', {}, function(node) {
    var element = $u(node);
    var list = element.find('ul.databases');
    query('SELECT datname FROM pg_database WHERE datistemplate = false;', function(rows) {
      rows.rows.forEach(function(dbrow) {
        var tree = DOMinate([
          'li', ['a', dbrow.datname]
        ]);
        list.append(tree[0]);
      });
    });
  })
}

*/