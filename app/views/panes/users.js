global.Panes.Users = global.Pane.extend({

  renderTab: function(rows) {
    rows.forEach(function(row) {
      row.roles = [];
      if (row.rolsuper) row.roles.push("Superuser");
      if (row.rolcreaterole) row.roles.push("Create role");
      if (row.rolcreatedb) row.roles.push("Create DB");
      if (row.rolreplication) row.roles.push("Replication");
    });

    var node = App.renderView('users_tab', {rows: rows});
    this.view.setTabContent('users', node);
    this.initEvents(this.view.tabContent('users'));
  },

  openNewUserDialog: function () {
    Dialog.NewUser.render(this.handler);
  }
});