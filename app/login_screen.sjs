global.LoginScreen = jClass.extend({
  init: function () {
    this.content = App.renderView('home');
    this.form = this.content.find('form');
    this.connections = this.content.find('ul.connections');
    this.form.bind('submit', this.onFormSubmit.bind(this));
    this.form.find('#save-and-connect').bind('click', this.saveAndConnect.bind(this));
    this.fillSavedConnections();

    this.content.find('a.go-to-help').bind('click', function() {
      var help = HelpScreen.open();
      help.activatePage("get-postgres");
    });
  },

  fillSavedConnections: function () {
    this.connections.empty();
    var data = App.savedConnections();
    for (var name in data) {
      var _this = this, line = $dom(['li', name]);

      !function (params) {
        $u.contextMenu(line, {
          "Fill form with ...": _this.fillForm.bind(_this, name, params),
          "Connect": function () {
            _this.fillForm(params, name);
            _this.onFormSubmit();
          },
          'separator': 'separator',
          "Rename": _this.renameConnection.bind(_this, name),
          "Delete": _this.deleteConnection.bind(_this, name)
        });


        $u(line).bind('click', _this.fillForm.bind(_this, name, params));
      }(data[name], name)

      this.connections.append(line)
    }
  },

  fillForm: function (name, params) {
    var v;
    this.connectionName = name;
    for (var k in params) { v = params[k];
      this.form.find('input[name=' + k + ']').val(v);
    }
  },

  renameConnection: function (name) {
    window.alertify.prompt("Rename connection?", lambda (confirm, newName) {
      if (confirm) {
        App.renameConnection(name, newName);
        this.fillSavedConnections();
      }
    }, name);
  },

  deleteConnection: function (name) {
    window.alertify.labels.ok = "Remove";
    window.alertify.confirm("Remove connection " + name + "?", function (res) {
      window.alertify.labels.ok = "OK";
      if (res) {
        App.removeConnection(name);
        this.fillSavedConnections();
      }
    }.bind(this));
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
    this.fillSavedConnections();
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

    var conn = new Connection(options, lambda (status, message) {
      if (status) {
        App.addDbScreen(conn, this.connectionName).activate();
        //App.lastAddedTab().activate();
        if (callback) callback();
      } else {
        // TODO: window.alert cause application crush
        //window.alert('' + message);
        window.alertify.alert(this.humanErrorMessage(message));
      }
    }.bind(this));
    global.conn = conn; // TODO: clean
  },

  humanErrorMessage: function (error) {
    if (error == "connect ECONNREFUSED") {
      return "Connection refused.<br>Make sure postgres is running";
    }
  },
});