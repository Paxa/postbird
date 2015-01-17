global.Dialog.ImportFile = global.Dialog.extend({
  title: "Import options",
  dialogClass: "import-file-dialog",

  init: function (handler, filename, onSubmit) {
    this.filename = filename;
    this.onSubmitCallback = onSubmit;
    this.handler = handler;
    this.showWindow();
  },

  showWindow: function () {
    this.databaseList(function (databases) {
      var nodes = App.renderView('dialogs/import_file', {
        filename: this.filename,
        databases: databases,
        currentDb: this.handler.database
      });

      this.content = this.renderWindow(this.title, nodes);

      var newDbNameInput = this.content.find("p.new-database-input");
      this.content.find("select").bind('change', function (event) {
        if (this.value == '**create-db**') {
          newDbNameInput.show();
          console.log(newDbNameInput.find('input'));
          newDbNameInput.find('input').focus();
        } else {
          newDbNameInput.hide();
        }
      });
      this.bindFormSubmitting();
    }.bind(this));
  },

  startImporting: function () {
    this.addClass('importing');
  },

  onSubmit: function (data) {
    this.onSubmitCallback && this.onSubmitCallback(data);
  },

  addMessage: function(message) {
    message = message.replace(/\n/g, "<br>");

    var element = this.content.find('code.result')[0];
    element.innerHTML += message;
  },

  showCloseButton: function () {
    this.content.find("p.buttons").hide();
    this.content.find("p.buttons.close-btn").show();
  },

  databaseList: function (callback) {
    this.handler.listDatabases(function (databases) {
      callback(databases);
    });
  }

});

global.Dialog.ImportFile.render = function (handler) {
  new global.Dialog.ImportFile(handler);
};