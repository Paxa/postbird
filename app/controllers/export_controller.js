global.ExportController = jClass.extend({
  init: function () {
    // TODO: Detect connected tab
    if (App.currentTab.instance.type != "db_screen") {
      throw new Error("Please connecto to database");
    }

    Object.defineProperty(this, "handler", {
      get: function () {
        return App.currentTab.instance;
      }
    });

  },

  doExport: function () {
    this.dialog = Dialog.ExportFile(this.handler, function (filename) {
      this.runPgDump(filename);
    }.bind(this));
  },

  runPgDump: function (filename) {
    var exporter = new SqlExporter({debug: false});

    this.dialog.startExporting();
    this.dialog.addMessage("Start exporting '" + this.handler.database + "'\n");

    exporter.onMessage(function (message, is_good) {
      this.dialog.addMessage(message);
    }.bind(this));

    exporter.doExport(this.handler.connection, filename, function (success, result) {
      this.dialog.addMessage(success ? "SUCCESS\n" : "FAILED\n");
      if (filename && success) {
        this.dialog.addMessage("Saved to file " + filename);
      }
      this.dialog.showCloseButton();
    }.bind(this));
  },

  currentTab: function () {
    return App.currentTab.instance;
  }
});
