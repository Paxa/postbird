class NewTable extends Dialog {
  constructor(handler) {
    super(handler, {
      title: "New table",
      dialogClass: "new-table-dialog"
    });
    this.showWindow();
  }


  showWindow () {
    this.handler.connection.tableSchemas((schemas) => {
      //console.log(schemas);
      var nodes = App.renderView('dialogs/new_table');
      this.content = this.renderWindow(this.title, nodes);

      var tablespaces = this.content.find('select[name=tablespace]');
      if (schemas.indexOf('public') == -1) {
        tablespaces.append( $u.buildOption('public', 'public') );
      }
      schemas.forEach((schema) => {
        tablespaces.append( $u.buildOption(schema, schema) );
      });

      this.setAutofocus();
      this.bindFormSubmitting();
    });
  }

  onSubmit (data) {
    this.handler.createTable(data, this.defaultServerResponse.bind(this));
  }
}

global.Dialog.NewTable = NewTable;
module.exports = NewTable;
