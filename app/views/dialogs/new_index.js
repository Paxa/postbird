class NewIndex extends Dialog {

  constructor (handler) {
    super(handler, {
      title: "Create index"
    });
    this.showWindow();
  }

  showWindow () {
    this.handler.tableObj().getColumns((columns) => {
      var nodes = App.renderView('dialogs/index_form', {columns: columns});
      this.content = this.renderWindow(this.title, nodes);
      this.bindFormSubmitting();
    });
  }

  onSubmit (data) {
    data.columns = [];
    for (var i in data) {
      if (i.match(/columns\[/)) {
        data.columns.push(data[i]);
      }
    }
    if (data.columns.length == 0) {
      window.alert("Please selectec at least 1 column");
      return;
    }
    this.handler.addIndex(data, this.defaultServerResponse.bind(this));
  }
}

global.Dialog.NewIndex = NewIndex;
module.exports = NewIndex;
