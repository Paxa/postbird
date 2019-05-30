class ImportFile extends DialogBase {
  /*::
  filename: string
  onSubmitCallback: (data: string) => void
  */

  constructor (handler, filename, onSubmit) {
    super(handler, {
      title: "Import Options",
      dialogClass: "import-file-dialog",
      filename: filename,
      onSubmitCallback: onSubmit
    });
    this.showWindow();
  }

  showWindow () {
    this.databaseList((databases) => {
      var nodes = App.renderView('dialogs/import_file', {
        filename: this.filename,
        databases: databases,
        currentDb: this.handler.database
      });

      this.content = this.renderWindow(this.title, nodes);

      var newDbNameInput = this.content.find("p.new-database-input");
      this.content.find("select").bind('change', (event) => {
        if (event.target.value == '**create-db**') {
          newDbNameInput.show();
          newDbNameInput.find('input').focus();
        } else {
          newDbNameInput.hide();
        }
      });
      this.bindFormSubmitting();
    });
  }

  startImporting () {
    this.addClass('importing');
    var btn = this.content.find('button.ok');
    btn.prop('disabled', true).text("Importing...");
  }

  onSubmit (data) {
    this.onSubmitCallback && this.onSubmitCallback(data);
  }

  addMessage(message) {
    message = message.replace(/\n/g, "<br>");

    var element = this.content.find('code.result')[0];
    element.innerHTML += message;
    element.scrollTop = element.scrollHeight;
  }

  showCloseButton () {
    this.content.find("p.buttons").hide();
    this.content.find("p.buttons.close-btn").show();
  }

  databaseList (callback) {
    this.handler.listDatabases((databases) => {
      callback(databases);
    });
  }

}

/*::
declare var ImportFile__: typeof ImportFile
*/
module.exports = ImportFile;
