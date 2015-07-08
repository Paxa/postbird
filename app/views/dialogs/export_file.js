global.Dialog.ExportFile = global.Dialog.extend({
  title: "Export options",
  dialogClass: "export-file-dialog",

  init: function (handler, callback) {
    this.handler = handler;
    this.onSubmitCallback = callback;
    this.showWindow();
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/export_file', {
      database: this.handler.database,
      hopePath: process.env.HOME || process.env.USERPROFILE
    });

    this.content = this.renderWindow(this.title, nodes);
    this.bindFormSubmitting();
  },

  startExporting: function () {
    this.addClass('exporting');
  },

  onSubmit: function (data) {
    var exportToFile = this.content.find('[name="export_to_file"]').val();
    var exportData = this.content.find('[name="export_data"]').prop('checked');
    var exportStructure = this.content.find('[name="export_structure"]').prop('checked');

    if (exportData === false && exportStructure === false) {
      window.alert("Please choose to export data or export structure or both");
      return false;
    }

    var options = {
      exportData: exportData,
      exportStructure: exportStructure
    };
    this.onSubmitCallback && this.onSubmitCallback(exportToFile, options);
  },

  showCloseButton: function () {
    this.content.find("p.buttons").hide();
    this.content.find("p.buttons.close-btn").show();
  },

  addMessage: function(message) {
    message = message.replace(/\n/g, "<br>");

    var element = this.content.find('code.result')[0];
    element.innerHTML += message;
  },
});
