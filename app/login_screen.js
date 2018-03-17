class LoginScreen {

  constructor (cliConnectString) {
    this.type = "login_screen";

    this.content = App.renderView('login_screen');
    this.form = this.content.find('form');
    this.connections = this.content.find('ul.connections');

    this.bindFormEvents();

    this.fillSavedConnections();
    if (this.connections.find('li:first').length) {
      this.connections.find('li:first').click();
    } else {
      this.fillForm(null, {user: process.env.USER});
    }

    if (cliConnectString) {
      this.makeConnection(cliConnectString, {});
    } else {
      this.checkAutoLogin();
    }

    this.initEvents(this.content);
  }

  bindFormEvents () {
    this.form.bind('submit', this.onFormSubmit.bind(this));

    this.form.find('input[type=text], input[type=password]').bind('keypress', (event) => {
      if (event.keyIdentifier == "Enter") {
        $u.stopEvent(event);
        this.onFormSubmit(event);
      }
    });

    this.form.find('input[type=text], input[type=password]').bind('focus', (event) => {
      this.formChanged(event);
    });

    this.form.find('input[type=text], input[type=password]').bind('keyup', this.formChanged.bind(this));

    this.form.find('input[type=checkbox]').bind('change', this.formChanged.bind(this));

    this.content.find('a.go-to-help').bind('click', () => {
      var help = HelpScreen.open();
      help.activatePage("get-postgres");
    });
  }

  showPart (name) {
    this.content.find('.middle-window').hide();
    this.content.find('.middle-window.' + name).show();
  }

  showPlainPane () {
    this.content.find('.login-with-password').hide();
    this.content.find('.login-with-heroku').show();
    this.showPart('plain');
  }

  showHerokuPane1 () {
    this.content.find('.login-with-password').show();
    this.content.find('.login-with-heroku').hide();
    this.showPart('heroku-1');
  }

  showHerokuOAuthPane () {
    this.showPart('heroku-oauth');
  }

  showHerokuCLPane () {
    this.showPart('heroku-cl');
  }

  startHerokuOAuth () {
    this.showHerokuOAuthPane();
    var steps = this.content.find('.heroku-oauth ul.steps');
    var options = {
      onAccessTokenStart:  () => { steps.find('.access-token').addClass('started'); },
      onAccessTokenDone:   () => { steps.find('.access-token').addClass('done'); },
      onRequestTokenStart: () => { steps.find('.request-token').addClass('started'); },
      onRequestTokenDone:  () => { steps.find('.request-token').addClass('done'); },
      onGetAppsStarted:    () => { steps.find('.get-apps').addClass('started'); },
      onGetAppsDone:       () => { steps.find('.get-apps').addClass('done'); }
    };

    var appsList = this.content.find('ul.apps').html('');
    HerokuClient.authAndGetApps((apps) => {
      apps.forEach((app) => {
        var appEl = $dom(['li', ['span', app.name], ['button', 'Connect'], {'app-name': app.name}]);
        appsList.append(appEl);
        $u(appEl).find('button').bind('click', (event) => {
          event.preventDefault();
          this.connectToHeroku(app);
        });
      });
    }, options);
  }

  connectToHeroku (heroku_app) {
    App.startLoading("Fetching config...");
    HerokuClient.getDatabaseUrl(heroku_app.id, (db_url) => {
      if (!db_url) {
        window.alertify.alert("Seems like app <b>" + heroku_app.name + "</b> don't have database");
        App.stopLoading();
        return;
      }
      db_url = db_url + "?ssl=verify-full";
      console.log('connecting to', db_url);
      this.makeConnection(db_url, {fetchDbList: false, name: heroku_app.name}, (tab) => {
        if (tab) {
          tab.instance.switchToHerokuMode(heroku_app.name, db_url);
        }
        console.log('connected to heroku');
      });
    });
  }

  openHerokuLoginWindow (link) {
    HerokuClient.auth(() => {
      console.log("authenticated");
    });
  }

  fillSavedConnections () {
    this.connections.empty();
    this.savedConnections = Model.SavedConn.savedConnections();
    var currentConnection = this.connectionName;

    var _this = this;
    Object.forEach(this.savedConnections, (name, params) => {
      var line = $dom(['li', {'data-auto-connect': params.auto_connect}, name]);

      $u.contextMenu(line, {
        "Fill form with ...": _this.fillForm.bind(_this, name, params),
        "Connect" () {
          _this.fillForm(params, name);
          _this.onFormSubmit();
        },
        'separator': 'separator',
        "Rename": _this.renameConnection.bind(_this, name),
        "Delete": _this.deleteConnection.bind(_this, name)
      });

      if (name == currentConnection) {
        $u(line).addClass('selected');
      }

      $u(line).single_double_click_nowait((e) => {
        _this.connectionSelected(name, params, line);
      }, (e) => {
        _this.connectionSelected(name, params, line);
        _this.onFormSubmit(e);
      });

      _this.connections.append(line)
    });
  }

  connectionSelected (name, params, line) {
    this.connections.find('.selected').removeClass('selected');
    $u(line).addClass('selected');
    this.connectionName = name;
    this.fillForm(name, params);
    this.setButtonShown(false);
  }

  testConnection () {
    App.startLoading("Connecting...");

    var options = this.getFormData();
    var conn = new Connection();
    conn.connectToServer(options, (status, message) => {
      App.stopLoading();
      if (status) {
        window.alertify.alert("Successfully connected!");
        conn.close();
      } else {
        window.alertify.alert(App.humanErrorMessage(message));
      }
    });
  }

  addNewConnection () {
    this.connectionName = "**new**";
    this.fillForm(undefined, {host: "localhost", user: "", password: "", database: ""});
    this.form.find('[name=host]').focus();
    this.setButtonShown(true);
  }

  fillForm (name, params) {
    params = Object.assign({}, {host: "localhost", user: "", password: "", database: "", query: ""}, params);

    Object.forEach(params, (k, v) => {
      var field = this.form.find('input[name=' + k + ']');
      if (field.attr("type") == "checkbox") {
        field.prop('checked', v);
      } else {
        field.val(v);
      }
    });
  }

  renameConnection (name) {
    window.alertify.prompt("Rename connection?", (confirm, newName) => {
      if (confirm) {
        Model.SavedConn.renameConnection(name, newName);
        this.fillSavedConnections();
      }
    }, name);
  }

  deleteConnection (name) {
    window.alertify.labels.ok = "Remove";
    window.alertify.confirm("Remove connection " + name + "?", (res) => {
      window.alertify.labels.ok = "OK";
      if (res) {
        Model.SavedConn.removeConnection(name);
        this.fillSavedConnections();
      }
    });
  }

  saveAndConnect (e) {
    $u.stopEvent(e);
    var name;

    if (this.connectionName) {
      name = this.connectionName;
    } else {
      var data = Model.SavedConn.savedConnections();
      var host = this.form.find('[name=host]').val();
      name = host;
      var i = 1;
      while (data[name]) {
        i += 1;
        name = host + ' #' + i;
      }
    }

    this.connectionName = name;
    this.onFormSubmit(null, () => {
      Model.SavedConn.saveConnection(name, this.getFormData());
      this.fillSavedConnections();
      this.setButtonShown(false);
    });
  }

  onFormSubmit (e, callback) {
    var button = this.form.find('input[type=submit]');
    var buttonText = button.val();
    button.attr('disabled', true).val("Connecting...");

    e && e.preventDefault();
    var options = this.getFormData();

    this.makeConnection(options, {}, (tab) => {
      button.removeAttr('disabled').val(buttonText);
      if (callback && tab) callback(tab);
    });
  }

  getFormData () {
    return {
      host: this.form.find('[name=host]').val(),
      port: this.form.find('[name=port]').val(),
      user: this.form.find('[name=user]').val(),
      query: this.form.find('[name=query]').val(),
      password: this.form.find('[name=password]').val(),
      database: this.form.find('[name=database]').val(),
      auto_connect: this.form.find('[name=auto_connect]').prop('checked')
    };
  }

  formChanged (event) {
    if (this.connectionName == "**new**") return;

    var formData = this.getFormData();
    var isChanged = !Model.SavedConn.isEqualWithSaved(this.connectionName, formData);

    if (isChanged) {
      this.setButtonShown(true);
    } else {
      this.setButtonShown(false);
    }
  }

  setButtonShown (isShown) {
    this.form.find("button")[isShown ? 'show' : 'hide']();
  }

  makeConnection (connectionOptions, options, callback) {
    App.openConnection(connectionOptions, options.name || this.connectionName, callback);
  }

  checkAutoLogin () {
    var autoConnect = null;
    Object.forEach(this.savedConnections, (key, connection) => {
      if (!autoConnect && connection.auto_connect) {
        autoConnect = key;
      }
    });

    if (autoConnect) {
      var connection = this.savedConnections[autoConnect];
      console.log("Connecting to auto-connect saved connection: " + autoConnect, connection);
      App.startLoading("Connecting...", 50);
      this.fillForm(autoConnect, connection);
      this.onFormSubmit();
    }
  }
}

LoginScreen.prototype.initEvents = Pane.prototype.initEvents;
global.LoginScreen = LoginScreen;
