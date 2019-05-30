class NewUser extends DialogBase {
  /*::
  user: Model.User
  buttonText: string
  */
  constructor (handler, params /*:: ?: any */) {
    params = Object.assign({title: "Create user", user: {}}, params);
    super(handler, params);
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/user_form', {user: this.user, buttonText: this.buttonText});

    this.content = this.renderWindow(this.title, nodes);
    this.bindFormSubmitting();
  }

  onSubmit (data) {
    if (this.validate(data)) {
      this.processData(data);
    }
  }

  async processData (data) {
    try {
      await this.handler.createUser(data);
      this.close();
    } catch (error) {
      console.error(error);
      window.alert(error.message);
    }
  }

  fail (msg) {
    setTimeout(() => {
      window.alert(msg);
    }, 100);
    return false;
  }

  validate (data) {
    if (!data.username || data.username.length == 0) return this.fail('Please type username');
    if (data.username.length > 63) {
      return this.fail("Username is too long, maximum is 63, you typed " + data.username.length);
    }

    return true;
  }
}

/*::
declare var NewUser__: typeof NewUser
*/
module.exports = NewUser;
