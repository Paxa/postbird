global.Dialog.NewIndex = global.Dialog.extend({
  title: "Create index",

  init: function (handler) {
    this.handler = handler;
    this.showWindow();
  },

  showWindow: function () {
    this.handler.tableObj().getColumns(function (columns) {
      var nodes = App.renderView('dialogs/index_form', {columns: columns});
      this.content = this.renderWindow(this.title, nodes);
      this.bindFormSubmitting();
    }.bind(this));
  },

  onSubmit: function (data) {
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
});