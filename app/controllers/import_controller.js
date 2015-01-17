global.ImportController = jClass.extend({
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

  doImport: function () {
    $u.openFileDialog('.sql', function (filepath) {
      this.filename = filepath;
      this.showImportDialog();
    }.bind(this));
  },

  showImportDialog: function () {
    var shorterName = this.filename.replace(new RegExp("^" + process.env['HOME']), '~');
    this.dialog = Dialog.ImportFile(this.handler, shorterName, function (data) {
      this.setOrCreateDatabase(data);
    }.bind(this));
  },

  setOrCreateDatabase: function(data) {
    if (data.database == '**create-db**') {
      if (!data.new_database_name || data.new_database_name == '') {
        window.alert('Please fill database name');
        return;
      }

      this.dialog.addMessage("Creating database '" + data.new_database_name + "'\n");
      this.handler.createDatabase({dbname: data.new_database_name}, function (error, result) {
        //this.dialog.addMessage("OK\n");
        this.loadSqlFile();
      }.bind(this));
    } else {
      this.dialog.addMessage("Select database '" + data.database + "'\n");
      this.handler.setDatabase(data.database, function (error, relust) {
        //this.dialog.addMessage("OK\n");
        this.loadSqlFile();
      }.bind(this));
    }
  },

  loadSqlFile: function() {
    this.dialog.startImporting();
    //this.dialog.addMessage("Importing " + this.filename + " ...");
    var importer = new SqlImporter(this.filename);

    importer.onMessage(function (message, is_good) {
      this.dialog.addMessage(message);
    }.bind(this));

    importer.doImport(this.handler.connection, function(success) {
      console.log("Import finish: " + (success ? "SUCCESS" : "FAILURE") + " File: " + this.filename);
      this.dialog.addMessage(success ? "SUCCESS" : "FAILURE");
      this.dialog.showCloseButton();
      this.handler.fetchTablesAndSchemas();
    }.bind(this));
  },

  currentTab: function () {
    return App.currentTab.instance;
  }
});
