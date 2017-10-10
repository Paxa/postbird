global.Dialog.NewUser = global.Dialog.extend({
  title: "Create user",

  init: function (handler) {
    this.handler = handler;
    this.user = this.user || {};
    this.showWindow();
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/user_form', {user: this.user, buttonText: this.buttonText});

    this.content = this.renderWindow(this.title, nodes);
    this.bindFormSubmitting();
  },

  onSubmit: function (data) {
    if (this.validate(data)) {
      this.processData(data);
    }
  },

  processData: function (data) {
    this.handler.createUser(data, (data, error) => {
      if (error)
        window.alert(error.message);
      else
        this.close();
    });
  },

  fail: function (msg) {
    setTimeout(() => {
      window.alert(msg);
    }, 100);
    return false;
  },

  validate: function (data) {
    if (!data.username || data.username.length == 0) return this.fail('Please type username');
    if (data.username.length > 63) return this.fail("Username is too long, maximum is 63, " +
                                               "you typed " + data.username.length);

    return true;
  }
});

global.Dialog.NewUser.render = function (handler) {
  new global.Dialog.NewUser(handler);
};