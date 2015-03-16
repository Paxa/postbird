global.Dialog.ExportFile = global.Dialog.extend({
  title: "Import options",
  dialogClass: "export-file-dialog",

  init: function (handler, callback) {
    this.handler = handler;
    this.onSubmitCallback = callback;
    this.showWindow();
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/export_file', {
      database: this.handler.database
    });

    this.content = this.renderWindow(this.title, nodes);
    this.bindFormSubmitting();
  },

  startExporting: function () {
    this.addClass('exporting');
  },

  onSubmit: function (data) {
    var exportToFile = this.content.find('[name="export_to_file"]').val();
    this.onSubmitCallback && this.onSubmitCallback(exportToFile);
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
