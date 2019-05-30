class ExportController {
  /*::
  dialog: Dialog.ExportFile
  filename: string
  */
  constructor () {
    // TODO: Detect connected tab
    if (App.currentTab.instance.type != "db_screen") {
      $u.alert("Please connect to database", {type: "warning"});
    }

  }

  get handler () {
    return App.currentTab.instance;
  }

  doExport () {
    this.dialog = new Dialog.ExportFile(this.handler, (filename, options) => {
      this.runPgDump(filename, options);
    });
  }

  async runPgDump (filename, options) {
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

    exporter.onMessage(message => {
      this.dialog.addMessage(message);
    });

    App.startLoading(`Saving dump to ${filename}`);
    try {
      await exporter.doExport(this.handler.connection, filename);
      this.dialog.addMessage("SUCCESS\n");
      if (filename) {
        this.dialog.addMessage("Saved to file " + filename);
      }
      this.dialog.showCloseButton();
    } catch (error) {
      this.dialog.addMessage("FAILED\n");
    }
    App.stopLoading();
    this.dialog.showCloseButton();
  }
}

module.exports = ExportController;
global.ExportController = ExportController;