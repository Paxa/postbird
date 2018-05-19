class HerokuConnection extends Dialog {

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
    var parsed = Connection.parseConnectionString(this.databseUrl);

    Model.SavedConn.saveConnection(this.name, parsed);
    App.loginScreen.fillSavedConnections();

    window.alertify.hide();
    window.alertify.alert("Saved!");
  }

}

global.Dialog.HerokuConnection = HerokuConnection;
module.exports = HerokuConnection;
