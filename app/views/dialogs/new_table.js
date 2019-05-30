class NewTable extends DialogBase {
  constructor(handler) {
    super(handler, {
      title: "New Table",
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

  async onSubmit (data) {
    try {
      data = await this.handler.createTable(data);
      this.defaultServerResponse(data);
    } catch (error) {
      this.defaultServerResponse(null, error);
    }
  }
}

/*::
declare var NewTable__: typeof NewTable
*/
module.exports = NewTable;
