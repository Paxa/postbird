class HerokuConnection extends DialogBase {
  /*::
  name: string
  databseUrl: string
  loginScreen: LoginScreen
  */
  constructor (viewObj, name, databseUrl) {
    super(null, {
      title: "Heroku Connection",
      dialogClass: "heroku-connection-dialog",
      viewObj: viewObj,
      name: name,
      databseUrl: databseUrl
    });

    this.showWindow();
  }

  showWindow () {
    this.renderTemplate('dialogs/heroku_connection', {
      name: this.name,
      connectionUrl: this.databseUrl
    });

    if (Model.SavedConn.savedConnection(this.name)) {
      this.content.find('.save-conn').hide();
    }

    this.content.find('.save-conn').bind('click', this.saveConnection.bind(this));
  }

  saveConnection () {
    var data = {
      type: 'url',
      url: this.databseUrl,
      auto_connect: false
    };

    Model.SavedConn.saveConnection(this.name, data);
    App.loginScreen.fillSavedConnections();

    window.alertify.hide();
    window.alertify.alert("Saved!");
  }

}

/*::
declare var HerokuConnection__: typeof HerokuConnection
*/
module.exports = HerokuConnection;
