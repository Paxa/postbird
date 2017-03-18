global.Panes.Users = global.Pane.extend({

  renderTab: function(rows) {
    rows.forEach((row) => {
      row.roles = [];
      if (row.rolsuper) row.roles.push("Superuser");
      if (row.rolcreaterole) row.roles.push("Create role");
      if (row.rolcreatedb) row.roles.push("Create DB");
      if (row.rolreplication) row.roles.push("Replication");
    });

    this.currentUser = this.handler.connection.options.user;

    this.renderViewToPane('users', 'users_tab', {rows: rows, currentUser: this.currentUser});
    this.initTables();
  },

  editUser: function (username) {
    new Dialog.EditUser(this.handler, username);
  },

  newUserDialog: function () {
    new Dialog.NewUser(this.handler);
  },

  deleteUser: function (username) {
    window.alertify.confirm('Do you want to delete user "' + username + '"?', (res) => {
      if (res) {
        this.handler.deleteUser(username);
      }
    });
  }
});