global.Dialog.EditColumn = global.Dialog.NewColumn.extend({
  title: "Edit column",

  init: function(handler, columnName) {
    this.handler = handler;
    this.columnName = columnName;
    this.showWindow();
  },

  showWindow: function () {
    Model.Column.availableTypes(function (types) {
      var groupedTypes = this.groupTypes(types);
      this.handler.tableObj().getColumnObj(this.columnName, function(column) {
        this.columnObj = column;
        var nodes = App.renderView('dialogs/column_form', {groupedTypes: groupedTypes, data: column.data});
        this.content = this.renderWindow(this.title, nodes);
        this.bindFormSubmitting();
      }.bind(this));
    }.bind(this));
  },

  onSubmit: function(data) {
    this.columnObj.update(data);
    //ALTER TABLE tbl_name ALTER COLUMN col_name TYPE varchar (11);
  }
});