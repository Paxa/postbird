global.LoginScreen = jClass.extend({
  init: function () {
    this.content = App.renderView('home');
    this.form = this.content.find('form');
    this.connections = this.content.find('ul.connections');
    this.form.bind('submit', this.onFormSubmit.bind(this));
    this.form.find('#save-and-connect').bind('click', this.saveAndConnect.bind(this));
    this.fillSavedConnections();
  },

  fillSavedConnections: function () {
    var data = App.savedConnections();
    for (var name in data) {
      var _this = this, line = $dom(['li', name]);

      !function (params) {
        $u.contextMenu(line, {
          "Fill form with ...": _this.fillForm.bind(_this, params),
          "Connect": function () {
            _this.fillForm(params);
            _this.onFormSubmit();
          },
          'separator': 'separator',
          "Rename": _this.renameConnection.bind(_this, name),
          "Delete": _this.deleteConnection.bind(_this, name)
        });


        $u(line).bind('click', function () {
          _this.fillForm(params);
        });
      }(data[name])

      this.connections.append(line)
    }
  },

  fillForm: function (params) {
    var v;
    for (var k in params) { v = params[k];
      this.form.find('input[name=' + k + ']').val(v);
    }
  },

  renameConnection: function (name) {
    
  },

  deleteConnection: function (name) {
    
  },

  saveAndConnect: function (e) {
    $u.stopEvent(e);
    var data = App.savedConnections();
    var host = this.form.find('[name=host]').val();
    var name = host, i = 1;
    while (data[name]) {
      i += 1;
      name = host + ' #' + i;
    }

    App.saveConnection(name, $u.formValues(this.form));
    this.onFormSubmit();
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