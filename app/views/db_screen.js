var formValues = function (selector_or_el) {
  var paramObj = {};
  $u.each($u(selector_or_el).serializeArray(), function(_, kv) {
    paramObj[kv.name] = kv.value;
  });

  return paramObj;
}

global.DbScreenView = jClass.extend({
  init: function (handler) {
    this.handler = handler;

    this.content = $u(App.renderView('main'));

    this.databaseSelect = this.content.find('.databases select');
    this.tablesList = this.content.find('.sidebar .tables ul');

    this.topTabs = this.content.find('.main > .window-tabs > .tab, .sidebar ul.extras li');
    this.tabContents = this.content.find('.main > .window-content');

    this.topTabs.each(function(i, el) {
      $u(el).bind('click', function(e) {
        var tabName = $u(e.target).attr('tab');
        e.preventDefault();
        this.showTab(tabName);
      }.bind(this));
    }.bind(this));

    this.databaseSelect.bind('change', function(e) {
      if (('' + this.databaseSelect.val()) == '') {
        this.content.find('.sidebar').removeClass('database-selected');
      } else {
        this.content.find('.sidebar').addClass('database-selected');
      }
    }.bind(this));
  },

  renderDbList: function (databases) {
    databases.forEach(function(dbname) {
      this.databaseSelect.append($dom(
        ['option', {value: dbname}, dbname]
      ));
    }.bind(this));
  },

  renderTablesAndSchemas: function (data) {
    this.tablesList.empty();
    var _this = this;
    var schema;
    for (schema in data) {
      var tables = data[schema];
      var schemaTree = DOMinate(['li', ['span', schema], ['ul$list']]);
      if (schema == 'public') $u(schemaTree[0]).addClass('open');

      !function (t) {
        t.find('span').bind('click', function() {
          t.toggleClass('open');
        });
      }($u(schemaTree[0]));

      data[schema].forEach(function(table) {
        var tableNode = $dom(['li', table.table_name]);
        $u(schemaTree.list).append(tableNode);

        !function (schema) {
          $u(tableNode).bind('click', function(e) {
            e && e.preventDefault();
            _this.handler.tableSelected(schema, table.table_name, e.target);
          });
        }(schema);

      });

      this.tablesList.append(schemaTree[0]);
    }
  },

  getSelectedDatabase: function () {
    return this.databaseSelect.val();
  },

  showTab: function(name) {
    if (this.currentTab) {
      this.topTabs.filter('.' + this.currentTab).removeClass('active');
      this.tabContents.filter('.' + this.currentTab).removeClass('active');
    }

    this.topTabs.filter('.' + name).addClass('active');
    this.tabContents.filter('.' + name).addClass('active');
    this.currentTab = name;

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

  renderTableStructureTab: function(rows) {
    var node = App.renderView('structure_tab', {rows: rows});
    this.setTabContent('structure', node);
  },

  renderExtensionsTab: function (rows) {
    var node = App.renderView('extensions_tab', {rows: rows});
    this.setTabContent('extensions', node);
  },

  renderContentTab: function (data) {
    var node = App.renderView('content_tab', {data: data});
    this.setTabContent('content', node);
  },

  renderUsersTab: function(rows) {

    rows.forEach(function(row) {
      row.roles = [];
      if (row.rolsuper) row.roles.push("Superuser");
      if (row.rolcreaterole) row.roles.push("Create role");
      if (row.rolcreatedb) row.roles.push("Create DB");
      if (row.rolreplication) row.roles.push("Replication");
    });

    var node = App.renderView('users_tab', {rows: rows});
    this.setTabContent('users', node);
    this.tabContent('users').find('.createUserBtn').bind('click', this.newUserWindow.bind(this));
  },

  openExtraWindow: function (title, nodes) {
    var el = $u('<div>').append(nodes);

    var titleHtml = $u('<h3>').addClass('window-title').text(title)[0].outerHTML;
    var windowHtml = titleHtml + el.html();

    var a = window.alertify.alert(windowHtml, undefined, 'custom-window');
    return $u('#alertify .alertify-inner');
  },

  closeExtraWindow: function () {
    window.alertify.hide();
  },

  newUserWindow: function () {
    var nodes = App.renderView('user_form');

    var content = this.openExtraWindow('Create user', nodes);

    console.log(content.find('button.ok'));
    content.find('button.ok').bind('click', function(e) {
      e && e.preventDefault();
      console.log( formValues(content.find('form')) );

      this.closeExtraWindow();
    }.bind(this));

    content.find('button.cancel').bind('click', function(e) {
      e && e.preventDefault()
      this.closeExtraWindow();
    }.bind(this));
  }
});