class LoginStandardForm {
  
    loginForm: LoginScreen
    form: JQuery<HTMLElement>
  
  constructor(loginForm, content) {
    this.loginForm = loginForm;
    this.form = content.find('form.standard');

    this.initEvents();
  }

  initEvents () {
    this.form.bind('submit', this.onFormSubmit.bind(this));

    var allInputs = this.form.find('input[type=text], input[type=password]');

    allInputs.bind('keypress', (event) => {
      if (event.keyCode == 13) { // enter key
        $u.stopEvent(event);
        this.onFormSubmit(event);
      }
    });

    allInputs.bind('focus', (e) => { this.formChanged() });
    allInputs.bind('keyup', (e) => { this.formChanged() });

    this.form.find('input[type=checkbox]').bind('change', this.formChanged.bind(this));
  }

  getFormData (): ConnectionOptions  {
    return {
      type: 'standard',
      connection_name: (this.form.find('[name=connection_name]').val() || '').toString(),
      host: this.form.find('[name=host]').val().toString(),
      port: this.form.find('[name=port]').val().toString(),
      user: this.form.find('[name=user]').val().toString(),
      query: this.form.find('[name=query]').val().toString(),
      password: this.form.find('[name=password]').val().toString(),
      database: this.form.find('[name=database]').val().toString(),
      sql_query: this.form.find('[name=sql_query]').val().toString(),
      ssh_host: (this.form.find('[name=ssh_host]').val() || '').toString(),
      ssh_port: (this.form.find('[name=ssh_port]').val() || '').toString(),
      ssh_user: (this.form.find('[name=ssh_user]').val() || '').toString(),
      ssh_pass: (this.form.find('[name=ssh_pass]').val() || '').toString(),
      ssh_key: (this.form.find('[name=ssh_key]').val() || '').toString(),
      auto_connect: this.form.find('[name=auto_connect]').prop('checked')
    };
  }

  formChanged () {
    if (this.loginForm.isNewConnection()) return;

    var formData = this.getFormData();
    var isChanged = !this.loginForm.sameAsCurrent(formData);

    if (isChanged) {
      this.setButtonShown(true);
    } else {
      this.setButtonShown(false);
    }
  }

  setButtonShown (isShown) {
    this.form.find("button")[isShown ? 'show' : 'hide']();
  }

  onFormSubmit (e  ?: any , callback  ?: Function ) {
    $u.stopEvent(e);
    var button = this.form.find('input[type=submit]');
    var buttonText = button.val();
    button.prop('disabled', true).val("Connecting...");
    this.setButtonShown(false);

    var options = this.getFormData();
    var connectionName = (options.connection_name || '').trim() || this.loginForm.connectionName;
    var isLocal = !options.host || options.host === 'localhost' || options.host === '127.0.0.1';
    if (!connectionName || connectionName === '**new**' || ((connectionName === '127.0.0.1' || connectionName === 'localhost') && options.ssh_host)) {
      if (options.ssh_host && isLocal) {
        connectionName = options.ssh_host;
      }
    }

    this.loginForm.makeConnection(options, { name: connectionName }, (tab) => {
      button.removeAttr('disabled').val(buttonText);
      this.formChanged();
      if (callback && tab) callback(tab);
    });
  }

  fillForm (params) {
    var defaultName = (params && params.connection_name) ? params.connection_name : (this.loginForm.connectionName && this.loginForm.connectionName !== '**new**' ? this.loginForm.connectionName : '');
    params = Object.assign({}, {
      connection_name: defaultName,
      host: "localhost",
      user: "",
      password: "",
      database: "",
      query: "",
      sql_query: "",
      ssh_host: "",
      ssh_port: "",
      ssh_user: "",
      ssh_pass: "",
      ssh_key: "",
      auto_connect: false
    }, params);

    ObjectKit.forEach(params, (k, v) => {
      var field = this.form.find('input[name=' + k + ']');
      if (field.attr("type") == "checkbox") {
        field.prop('checked', v);
      } else {
        field.val(v);
      }
    });

    this.setButtonShown(false);
  }

  testConnection () {
    var showConnectionError = true;
    App.startLoading("Connecting...", 500, {
      cancel() {
        App.stopRunningQuery();
        App.stopLoading();
        showConnectionError = false;
      }
    });

    var options = this.getFormData();
    var conn = new Connection();
    conn.connectToServer(options, (status, error) => {
      App.stopLoading();
      if (status) {
        window.alertify.alert("Successfully connected!");
        conn.close();
      } else {
        if (showConnectionError) {
          $u.alertError("Connection Error", {
            detail: App.humanErrorMessage(error, options)
          });
        } else {
          console.error(error)
        }
        //window.alertify.alert(App.humanErrorMessage(message));
      }
    });
  }

  saveAndConnect (e  ?: any ) {
    var formData = this.getFormData();
    var customName = (formData.connection_name || '').trim();
    var sshHost = (formData.ssh_host || '').trim();
    var host = (formData.host || '').trim();

    var isDefaultLocal = !host || host === 'localhost' || host === '127.0.0.1';
    var preferredName = customName || ((sshHost && isDefaultLocal) ? sshHost : (host || sshHost || 'localhost'));

    var currentName = this.loginForm.connectionName;
    var isGenericName = !currentName || currentName === '**new**' || currentName === '127.0.0.1' || currentName === 'localhost';

    if (customName && customName !== currentName) {
      if (currentName === '**new**') {
        Model.SavedConn.removeConnection('**new**');
      }
      this.loginForm.connectionName = customName;
    } else if (isGenericName || (sshHost && (currentName === '127.0.0.1' || currentName === 'localhost'))) {
      var data = Model.SavedConn.savedConnections();
      var baseName = preferredName;
      var name = baseName;
      var i = 1;
      while (data[name] && name !== currentName) {
        i += 1;
        name = baseName + ' #' + i;
      }

      if (currentName && currentName !== name && (currentName === '**new**' || ((currentName === '127.0.0.1' || currentName === 'localhost') && sshHost))) {
        Model.SavedConn.removeConnection(currentName);
      }

      this.loginForm.connectionName = name;
    }

    this.onFormSubmit(null, () => {
      Model.SavedConn.saveConnection(this.loginForm.connectionName, this.getFormData());
      this.loginForm.fillSavedConnections();
      this.setButtonShown(false);
    });
  }
}

(global as any).LoginStandardForm = LoginStandardForm;
