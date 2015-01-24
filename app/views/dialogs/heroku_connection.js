global.Dialog.HerokuConnection = global.Dialog.extend({
  title: "Heroku Connection",
  dialogClass: "heroku-connection-dialog",

  init: function (viewObj, name, databseUrl) {
    this.viewObj = viewObj;
    this.name = name;
    this.databseUrl = databseUrl;

    this.showWindow();
  },

  showWindow: function () {
    this.renderTemplate('dialogs/heroku_connection', {
      name: this.name,
      connectionUrl: this.databseUrl
    });

    if (Model.SavedConn.savedConnection(this.name)) {
      this.content.find('.save-conn').hide();
    }

    this.content.find('.save-conn').bind('click', this.saveConnection.bind(this));
  },

  saveConnection: function () {
    console.log(this.viewObj);
    console.log(this.viewObj.handler);
    console.log(this.viewObj.handler.connection);
    var parsed = this.viewObj.handler.connection.parseConnectionString(this.databseUrl);

    Model.SavedConn.saveConnection(this.name, parsed);

    window.alertify.hide();
    window.alertify.alert("Saved!");
  },

});