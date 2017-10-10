global.Dialog.EditUser = global.Dialog.NewUser.extend({
  title: "Edit user",

  init: function(handler, user) {
    this.username = user.rolname;
    this.user = user;
    this.buttonText = "Update User";
    this._super(handler);
  },

  processData: function(data) {
    App.startLoading(`Updating user ${this.username}`);

    this.handler.updateUser(this.username, data, (data, error) => {
      App.stopLoading();

      if (error)
        window.alert(error.message);
      else
        this.close();
    });
  },

  validate: function (data) {
    if (this._super(data) == true) {
      if (this.username != data.username && data.password == '') {
        return this.fail('Password is required when renaming user');
      } else {
        return true;
      }
    }
  }
});