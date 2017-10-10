global.Panes.Users = global.Pane.extend({

  renderTab: function(rows) {
    this.users = {};
    rows.forEach((row) => {
      row.roles = [];
      if (row.rolsuper) row.roles.push("Superuser");
      if (row.rolcreaterole) row.roles.push("Create role");
      if (row.rolcreatedb) row.roles.push("Create DB");
      if (row.rolreplication) row.roles.push("Replication");
      this.users[row.rolname] = row;
    });

    this.currentUser = this.handler.connection.options.user;

    this.renderViewToPane('users', 'users_tab', {rows: rows, currentUser: this.currentUser});
    this.initTables();
  },

  editUser: function (username) {
    console.log(username, this.users[username]);
    new Dialog.EditUser(this.handler, this.users[username]);
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
  },

  getGrants: function (username) {
    App.startLoading("Loading user grants...");
    var user = new Model.User(username);
    user.getGrants().then(result => {
      App.stopLoading();
      new Dialog.UserGrants(`Grants for ${username}`, result.rows);
    }).catch(error => {
      App.stopLoading();
      alert(error.message);
    });
  }
});
