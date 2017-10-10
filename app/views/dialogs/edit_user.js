class EditUser extends Dialog.NewUser {

  constructor(handler, user) {
    super(handler, {
      title: "Edit user",
      user: user,
      username: user.rolname,
      buttonText: "Update User"
    });
  }

  async processData (data) {
    try {
      await this.handler.updateUser(this.username, data);
      this.close();
    } catch (error) {
      console.error(error);
      window.alert(error.message);
    }

    App.stopLoading();
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
