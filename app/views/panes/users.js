/*::
interface Users_UsersMap {
  [column: string] : Model.User
}
*/

class Users extends PaneBase {
  /*::
    users: Users_UsersMap
    currentUser: string
  */

  renderTab (rows) {
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
  }

  renderError(error) {
    this.handler.view.setTabMessage(`Error: ${error.message}`);
    //errorReporter(error);
  }

  editUser (username) {
    new Dialog.EditUser(this.handler, this.users[username]);
  }

  newUserDialog () {
    new Dialog.NewUser(this.handler);
  }

  async deleteUser (username) {
    var res = await window.alertify.confirm('Do you want to delete user "' + username + '"?');

    if (res) {
      App.startLoading(`Deleting user ${username}`);
      try {
        await this.handler.deleteUser(username);
      } catch (error) {
        console.error(error);
        window.alert(error.message);
      }
      App.stopLoading();
    }
  }

  async getGrants (username) {
    App.startLoading("Loading user grants...");

    try {
      var user = new Model.User(username);
      var result = await user.getGrants();

      App.stopLoading();
      new Dialog.UserGrants(`Grants for ${username}`, result.rows);
    } catch (error) {
      App.stopLoading();
      alert(error.message);
    }
  }
}

/*::
declare var Users__: typeof Users
*/

module.exports = Users;
