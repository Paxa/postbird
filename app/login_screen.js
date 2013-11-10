global.LoginScreen = jClass.extend({
  init: function () {
    this.content = App.renderView('home');
    this.form = this.content.find('form');

    this.form.bind('submit', this.onFormSubmit.bind(this));
  },

  onFormSubmit: function (e, callback) {
    e && e.preventDefault();

    var options = {
      host: this.form.find('[name=host]').val(),
      port: this.form.find('[name=port]').val(),
      user: this.form.find('[name=user]').val(),
      password: this.form.find('[name=password]').val(),
      database: this.defaultDatabaseName
    };

    var conn = new Connection(options, function (status, message) {
      if (status) {
        App.addDbScreen(conn).activate();
        //App.lastAddedTab().activate();
        if (callback) callback();
      } else {
        // TODO: window.alert cause application crush
        //window.alert('' + message);
        window.alertify.alert('' + message);
      }
    });
    global.conn = conn; // TODO: clean
  }
});