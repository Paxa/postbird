global.LoginScreen = jClass.extend({
  type: "login_screen",

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

    this.initEvents(this.content);
  },

  showPart: function (name) {
    this.content.find('.middle-window').hide();
    this.content.find('.middle-window.' + name).show();
  },

  showPlainPane: function() {
    this.content.find('.login-with-password').hide();
    this.content.find('.login-with-heroku').show();
    this.showPart('plain');
  },

  showHerokuPane1: function () {
    this.content.find('.login-with-password').show();
    this.content.find('.login-with-heroku').hide();
    this.showPart('heroku-1');
  },

  showHerokuOAuthPane: function () {
    this.showPart('heroku-oauth');
  },

  showHerokuCLPane: function () {
    this.showPart('heroku-cl');
  },

  startHerokuOAuth: function () {
    this.showHerokuOAuthPane();
    var steps = this.content.find('.heroku-oauth ul.steps');
    var options = {
      onAccessTokenStart:  function() { steps.find('.access-token').addClass('started'); },
      onAccessTokenDone:   function() { steps.find('.access-token').addClass('done'); },
      onRequestTokenStart: function() { steps.find('.request-token').addClass('started'); },
      onRequestTokenDone:  function() { steps.find('.request-token').addClass('done'); },
      onGetAppsStarted:    function() { steps.find('.get-apps').addClass('started'); },
      onGetAppsDone:       function() { steps.find('.get-apps').addClass('done'); }
    };

    var appsList = this.content.find('ul.apps');
    HerokuClient.authAndGetApps(function(apps) {
      apps.forEach(function(app) {
        var appEl = $dom(['li', ['span', app.name], ['button', 'Connect'], {'app-name': app.name}]);
        appsList.append(appEl);
        $u(appEl).find('button').bind('click', function (event) {
          event.preventDefault();
          this.connectToHeroku(app);
        }.bind(this));
      }.bind(this));
    }.bind(this), options);
  },

  connectToHeroku: function (heroku_app) {
    App.startLoading("Fetching config...");
    HerokuClient.getDatabaseUrl(heroku_app.id, function(db_url) {
      if (!db_url) {
        window.alertify.alert("Seems like app <b>" + heroku_app.name + "</b> don't have database");
        App.stopLoading();
        return;
      }
      db_url = db_url + "?ssl=true";
      console.log('connecting to', db_url);
      this.makeConnection(db_url, {fetchDbList: false, name: heroku_app.name}, function(tab) {
        if (tab) {
          tab.instance.switchToHerokuMode(heroku_app.name, db_url);
        }
        console.log('connected to heroku');
      });
    }.bind(this));
  },

  openHerokuLoginWindow: function(link) {
    HerokuClient.auth(function() {
      console.log("authenticated");
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
    window.alertify.prompt("Rename connection?", function (confirm, newName) {
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
      database: this.form.find('[name=database]').val()
    };
    this.makeConnection(options, {}, callback);
  },

  makeConnection: function (connectionOptions, options, callback) {
    App.startLoading("Connecting...");

    if (typeof callback == 'undefined' && typeof options == 'function') {
      callback = options;
      options = {};
    }

    var conn = new Connection(connectionOptions, function (status, message) {
      App.stopLoading();
      if (status) {
        var tab = App.addDbScreen(conn, options.name || this.connectionName, options);
        tab.activate();
        if (callback) callback(tab);
      } else {
        window.alertify.alert(this.humanErrorMessage(message));
      }
    }.bind(this));
    global.conn = conn; // TODO: clean
  },

  humanErrorMessage: function (error) {
    if (error == "connect ECONNREFUSED") {
      return "Connection refused.<br>Make sure postgres is running";
    } else {
      return error;
    }
  },
});

LoginScreen.prototype.initEvents = Pane.prototype.initEvents;