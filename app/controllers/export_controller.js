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
    this.dialog = Dialog.ExportFile(this.handler, (filename, options) => {
      this.runPgDump(filename, options);
    });
  },

  runPgDump: function (filename, options) {
    var exporter = new SqlExporter({debug: false});

    if (options.exportData === false) {
      exporter.setOnlyStructure();
    }

    if (options.exportStructure === false) {
      exporter.setOnlyData();
    }

    if (options.exportOwners === false) {
      exporter.setNoOwners();
    }

    this.dialog.startExporting();
    this.dialog.addMessage("Start exporting '" + this.handler.database + "'\n");

    exporter.onMessage((message, is_good) => {
      this.dialog.addMessage(message);
    });

    exporter.doExport(this.handler.connection, filename, (success, result) => {
      this.dialog.addMessage(success ? "SUCCESS\n" : "FAILED\n");
      if (filename && success) {
        this.dialog.addMessage("Saved to file " + filename);
      }
      this.dialog.showCloseButton();
    });
  },

  currentTab: function () {
    return App.currentTab.instance;
  }
});
