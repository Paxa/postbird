class EditUser extends Dialog.NewUser {

  constructor(handler, user) {
    super(handler, {
      title: "Edit user",
      user: user,
      username: user.rolname,
      buttonText: "Update User"
    });
  }

  processData (data) {
    App.startLoading(`Updating user ${this.username}`);

    this.handler.updateUser(this.username, data, (data, error) => {
      App.stopLoading();

      if (error)
        window.alert(error.message);
      else
        this.close();
    });
  }

  validate (data) {
    if (super.validate(data) == true) {
      if (this.username != data.username && data.password == '') {
        return this.fail('Password is required when renaming user');
      } else {
        return true;
      }
    }
  }
}

global.Dialog.EditUser = EditUser;
module.exports = EditUser;
