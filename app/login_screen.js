class LoginScreen {

  /*::
    type: string;
    content: JQuery<HTMLElement>;
    connections: JQuery<HTMLElement>;
    standardForm: LoginStandardForm;
    urlForm: LoginPostgresUrlForm;
    savedConnections: any; // Hash<string, SavedConn>;
    connectionName: string;
    herokuClient: HerokuClient;
    activeForm: string;
  */

  constructor (cliConnectString) {
    this.type = "login_screen";

    this.content = App.renderView('login_screen');
    this.standardForm = new LoginStandardForm(this, this.content);
    this.urlForm = new LoginPostgresUrlForm(this, this.content);
    this.connections = this.content.find('ul.connections');

    this.content.find('textarea').forEach(el => {
      $u.textareaAutoSize(el);
    });

    this.fillSavedConnections();
    if (this.connections.find('li:first').length) {
      this.connections.find('li:first').click();
    } else {
      this.fillForm({user: process.env.USER});
    }

    this.initEvents(this.content);

    if (cliConnectString) {
      this.makeConnection(cliConnectString, {});
    } else {
      this.checkAutoLogin();
    }

    this.herokuClient = new HerokuClient();
    this.activeForm = 'standard';
  }

  initEvents(content) {
    PaneBase.prototype.initEvents.call(this, content);

    this.content.find('a.go-to-help').bind('click', () => {
      var help = HelpScreen.open();
      help.activatePage("get-postgres");
    });
  }

  showPart (name) {
    this.activeForm = name;
    this.content.find('.middle-window-content').hide();
    this.content.find('.middle-window-content.' + name).show();
  }

  showStandardPane () {
    this.content.find('.header-tabs a').removeClass('selected');
    this.content.find('.header-tabs .login-with-password').addClass('selected');
    this.showPart('standard');
  }

  showHerokuPane () {
    this.content.find('.header-tabs a').removeClass('selected');
    this.content.find('.header-tabs .login-with-heroku').addClass('selected');
    this.showPart('heroku-1');
  }

  showUrlPane () {
    this.content.find('.header-tabs a').removeClass('selected');
    this.content.find('.header-tabs .enter-postgres-url').addClass('selected');
    this.showPart('postgres-url');
  }

  showHerokuOAuthPane () {
    this.showPart('heroku-oauth');
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
    this.herokuClient.authAndGetApps(apps => {
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
    this.herokuClient.getDatabaseUrl(heroku_app.id, (db_url) => {
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

  fillSavedConnections () {
    this.connections.empty();
    this.savedConnections = Model.SavedConn.savedConnections();
    var currentConnection = this.connectionName;

    ObjectKit.forEach(this.savedConnections, (name, params) => {
      var line = $dom(['li', {'data-auto-connect': params.auto_connect, 'data-name': name}, name]);

      $u.contextMenu(line, {
        "Fill form with ...": () => { this.fillForm(params) },
        "Connect" () {
          this.fillForm(params);
          this.submitCurrentForm();
        },
        'separator': 'separator',
        "Rename": () => {
          this.renameConnection(name);
        },
        "Delete": () => {
          this.deleteConnection(name);
        }
      });

      if (name == currentConnection) {
        $u(line).addClass('selected');
      }

      $u(line).single_double_click_nowait((e) => {
        this.connectionSelected(name, params, line);
      }, (e) => {
        this.connectionSelected(name, params, line);
        this.submitCurrentForm();
      });

      this.connections.append(line)
    });
  }

  connectionSelected (name, params, line) {
    this.connections.find('.selected').removeClass('selected');
    $u(line).addClass('selected');
    this.connectionName = name;
    this.fillForm(params);
    if (params.type == 'url') {
      this.showUrlPane();
      this.urlForm.setButtonShown(false);
    } else {
      this.showStandardPane();
      this.standardForm.setButtonShown(false);
    }
    //this.setButtonShown(false);
  }

  std_testConnection () {
    this.standardForm.testConnection();
  }

  url_testConnection () {
    this.urlForm.testConnection();
  }

  addNewConnection () {
    this.connections.find('.selected').removeClass('selected');
    this.connectionName = "**new**";
    this.fillForm({host: "localhost", user: "", password: "", database: "", port: ""});
    this.standardForm.form.find('[name=host]').focus();
    this.standardForm.setButtonShown(true);
  }

  fillForm (params) {
    if (params.type == "url") {
      this.urlForm.fillForm(params);
      this.standardForm.fillForm({});
      this.activeForm = 'postgres-url';
    } else {
      this.standardForm.fillForm(params);
      this.urlForm.fillForm({});
      this.activeForm = 'standard';
    }
  }

  submitCurrentForm() {
    if (this.activeForm == 'standard') {
      this.standardForm.onFormSubmit();
    } else {
      this.urlForm.onFormSubmit();
    }
  }

  async renameConnection (name, filledValue = null) {
    var newName = await $u.prompt("Rename connection?", filledValue || name);
    if (newName) {
      if (Model.SavedConn.hasConnection(newName)) {
        await $u.alert(`Connection '${newName}' already exists`, {detail: "Choose another connection name"})
        this.renameConnection(name, newName);
      } else {
        Model.SavedConn.renameConnection(name, newName);
        this.fillSavedConnections();
      }
    }
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

  std_saveAndConnect (e) {
    $u.stopEvent(e);
    this.standardForm.saveAndConnect();
  }

  url_saveAndConnect (e) {
    $u.stopEvent(e);
    this.urlForm.saveAndConnect();
  }

  makeConnection (connectionOptions, options, callback /*:: ?: Function */) {
    App.openConnection(connectionOptions, options.name || this.connectionName, callback);
  }

  checkAutoLogin () {
    var autoConnect = null;
    ObjectKit.forEach(this.savedConnections, (key, connection) => {
      if (!autoConnect && connection.auto_connect) {
        autoConnect = key;
      }
    });

    if (autoConnect) {
      var connection = this.savedConnections[autoConnect];
      console.log("Connecting to auto-connect saved connection: " + autoConnect, connection);
      App.startLoading("Connecting...", 50, {
        cancel() {
          App.stopRunningQuery();
          App.stopLoading();
        }
      });
      this.connectionSelected(autoConnect, connection, this.connections.find(`[data-name='${autoConnect}']`));
      this.submitCurrentForm();
    }
  }

  isNewConnection () {
    return this.connectionName == "**new**";
  }

  sameAsCurrent (formData) {
    return Model.SavedConn.isEqualWithSaved(this.connectionName, formData);
  }
}

global.LoginScreen = LoginScreen;
