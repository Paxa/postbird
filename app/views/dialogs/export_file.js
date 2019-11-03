/*::
interface ExportFile_CallbackOptions {
  exportData: boolean
  exportStructure: boolean
  exportOwners: boolean
}
*/

class ExportFile extends DialogBase {
  /*::
  onSubmitCallback: (exportToFile: string, options: ExportFile_CallbackOptions) => void
  */
  constructor (handler, callback) {
    super(handler, {
      title: "Export options",
      dialogClass: "export-file-dialog",
      onSubmitCallback: callback
    });
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/export_file', {database: this.handler.database});

    this.content = this.renderWindow(this.title, nodes);

    var dialog = electron.remote.dialog;
    var fileInput = this.content.find('[name=export_to_file]');
    fileInput.on('click', (e) => {
      e.preventDefault();
      var options = {
        message: `Postgres dump of '${this.handler.database}' database`,
        defaultPath: `${this.handler.database}.sql`,
      };
      dialog.showSaveDialog(electron.remote.app.mainWindow, options).then((res) => {
        if (res.filePath) {
          fileInput.val(res.filePath);
        }
      });
    });
    this.bindFormSubmitting();
  }

  startExporting () {
    this.addClass('exporting');
  }

  onSubmit (data) {
    var exportToFile = this.content.find('[name="export_to_file"]').val().toString();
    var exportData = this.content.find('[name="export_data"]').prop('checked');
    var exportStructure = this.content.find('[name="export_structure"]').prop('checked');
    var exportOwners = this.content.find('[name="objects_ownership"]').prop('checked');

    if (exportData === false && exportStructure === false) {
      window.alert("Please choose to export data or export structure or both");
      return false;
    }

    var options = {
      exportData: exportData,
      exportStructure: exportStructure,
      exportOwners: exportOwners
    };
    this.onSubmitCallback && this.onSubmitCallback(exportToFile, options);
  }

  showCloseButton () {
    this.content.find("p.buttons").hide();
    this.content.find("p.buttons.close-btn").show();
  }

  addMessage(message) {
    message = message.replace(/\n/g, "<br>");

    var element = this.content.find('code.result')[0];
    element.innerHTML += message;
  }

}

/*::
declare var ExportFile__: typeof ExportFile
*/
module.exports = ExportFile;
