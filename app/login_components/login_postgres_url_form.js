// @ts-ignore
var url = require('url');

class LoginPostgresUrlForm {
  /*::
    loginForm: LoginScreen
    form: JQuery<HTMLElement>
  */
  constructor(loginForm, content) {
    this.loginForm = loginForm;
    this.form = content.find('form.postgres-url');

    this.initEvents();
  }

  initEvents () {
    this.form.bind('submit', this.onFormSubmit.bind(this));

    var allInputs = this.form.find('input[type=text], input[type=password], textarea');

    allInputs.bind('focus', (e) => { this.formChanged() });
    allInputs.bind('keyup', (e) => { this.formChanged() });

    this.form.find('input[type=checkbox]').bind('change', this.formChanged.bind(this));
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

  fillForm (params) {
    params = Object.assign({}, {url: "", auto_connect: false}, params);
    ObjectKit.forEach(params, (k, v) => {
      if (k == 'url') k = 'connect_url';
      var field = this.form.find('input[name=' + k + '], textarea[name=' + k + ']');
      if (field.attr("type") == "checkbox") {
        field.prop('checked', v);
      } else {
        field.val(v);
      }
    });
    this.setButtonShown(false);
  }

  getFormData ()/*: ConnectionOptions */ {
    return {
      type: 'url',
      url: this.form.find('[name=connect_url]').val().toString(),
      auto_connect: this.form.find('[name=auto_connect]').prop('checked')
    };
  }

  setButtonShown (isShown) {
    this.form.find("button")[isShown ? 'show' : 'hide']();
  }

  onFormSubmit (e /*:: ?: any */, callback /*:: ?: Function */) {
    $u.stopEvent(e);
    var button = this.form.find('input[type=submit]');
    var buttonText = button.val();
    button.prop('disabled', true).val("Connecting...");
    this.setButtonShown(false);

    var options = this.getFormData();

    this.loginForm.makeConnection(options, {}, (tab) => {
      button.removeAttr('disabled').val(buttonText);
      this.formChanged();
      if (callback && tab) callback(tab);
    });
  }

  testConnection () {
    App.startLoading("Connecting...");

    var options = this.getFormData();
    var conn = new Connection();
    conn.connectToServer(options, (status, error) => {
      App.stopLoading();
      if (status) {
        window.alertify.alert("Successfully connected!");
        conn.close();
      } else {
        window.alertify.alert(App.humanErrorMessage(error));
      }
    });
  }

  async saveAndConnect (e /*:: ?: any */) {
    var data = this.getFormData();
    if (!this.loginForm.connectionName) {
      var existing = Model.SavedConn.savedConnections();
      var name = null;
      var suggested = null;
      try {
        suggested = url.parse(data.url).host;
      } catch (e) {
        console.error(e);
      }
      while (name == null || name == '') {
        name = await window.alertify.prompt("Enter connection name", () => {}, suggested);
        if (name === false) {
          return;
        }
        console.log(name);
        if (existing[name]) {
          await $u.alert(`Connection with name "${name}" already exist`);
          name = null;
        }
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

global.LoginPostgresUrlForm = LoginPostgresUrlForm;
