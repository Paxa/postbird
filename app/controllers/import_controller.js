class ImportController {
  /*::
  dialog: Dialog.ImportFile
  filename: string
  */
  constructor () {
    // TODO: Detect connected tab
  }

  get handler () {
    return App.currentTab.instance;
  }

  async doImport () {
    if (this.handler.type != "db_screen") {
      $u.alert("Please connect to database", {type: "warning"});
      return;
    }

    var files = await $u.openFileDialog('.sql');

    if (files && files.length > 0) {
      this.filename = files[0];
      this.showImportDialog();
    }
  }

  showImportDialog () {
    var shorterName = this.filename.replace(new RegExp("^" + process.env['HOME']), '~');
    this.dialog = new Dialog.ImportFile(this.handler, shorterName, (data) => {
      this.setOrCreateDatabase(data);
    });
  }

  setOrCreateDatabase (data) {
    if (data.database == '**create-db**') {
      if (!data.new_database_name || data.new_database_name == '') {
        window.alert('Please fill database name');
        return;
      }

      this.dialog.addMessage("Creating database '" + data.new_database_name + "'\n");
      this.handler.createDatabase({dbname: data.new_database_name}).then(() => {
        //this.dialog.addMessage("OK\n");
        this.loadSqlFile();
      });
    } else {
      this.dialog.addMessage("Select database '" + data.database + "'\n");
      this.handler.setDatabase(data.database, () => {
        //this.dialog.addMessage("OK\n");
        this.loadSqlFile();
      });
    }
  }

  loadSqlFile () {
    this.dialog.startImporting();
    //this.dialog.addMessage("Importing " + this.filename + " ...");
    var importer = new SqlImporter(this.filename);

    importer.onMessage(message => {
      this.dialog.addMessage(message);
    });

    importer.doImport(this.handler.connection, (success) => {
      console.log("Import finish: " + (success ? "SUCCESS" : "FAILURE") + " File: " + this.filename);
      this.dialog.addMessage(success ? "SUCCESS" : "FAILURE");
      this.dialog.showCloseButton();
      this.handler.fetchTablesAndSchemas();
    }).catch(error => {
      if (typeof error == 'string') {
        this.dialog.addMessage(error);
      } else {
        this.dialog.addMessage(`ERROR:\n${error.message}\n`);
      }
    });
  }
}

module.exports = ImportController;
global.ImportController = ImportController;