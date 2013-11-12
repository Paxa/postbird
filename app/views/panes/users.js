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

  editUser: function (username) {
    new Dialog.EditUser(this.handler, username);
  },

  newUserDialog: function () {
    new Dialog.NewUser(this.handler);
  },

  deleteUser: function (username) {
    window.alertify.confirm('Do you want to delete user "' + username + '"?', function(res) {
      if (res) {
        this.handler.deleteUser(username);
      }
    }.bind(this));
  }
});