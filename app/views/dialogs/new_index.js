class NewIndex extends DialogBase {

  constructor (handler) {
    super(handler, {
      title: "Create Index",
      dialogClass: "new-index-dialog"
    });
    this.showWindow();
  }

  showWindow () {
    this.handler.tableObj().getColumns().then(columns => {
      var nodes = App.renderView('dialogs/index_form', {columns: columns});
      this.content = this.renderWindow(this.title, nodes);
      this.bindFormSubmitting();
    });
  }

  async onSubmit (data) {
    data.columns = [];
    for (var i in data) {
      if (i.match(/columns\[/)) {
        data.columns.push(data[i]);
      }
    }
    if (data.columns.length == 0) {
      $u.alertError("Please select at least 1 column");
      return;
    }
    try {
      var result = await this.handler.addIndex(data);
      this.defaultServerResponse(result);
    } catch (error) {
      this.defaultServerResponse(null, error);
    }
  }
}

/*::
declare var NewIndex__: typeof NewIndex
*/
module.exports = NewIndex;
