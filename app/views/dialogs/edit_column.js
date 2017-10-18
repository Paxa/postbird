class EditColumn extends Dialog.NewColumn {

  constructor(handler, columnName) {
    super(handler, {
      title: "Edit column",
      columnName: columnName
    });
  }

  showWindow () {
    Model.Column.availableTypes((types) => {
      this.addPseudoTypes(types);
      var groupedTypes = this.groupTypes(types);
      this.handler.tableObj().getColumnObj(this.columnName, (column) => {
        this.columnObj = column;
        var nodes = App.renderView('dialogs/column_form', {groupedTypes: groupedTypes, data: column.data, action: "edit"});
        this.content = this.renderWindow(this.title, nodes);
        this.bindFormSubmitting();
      });
    });
  }

  onSubmit(data) {
    if (data.type == "") {
      window.alert("Please choose column type");
      return;
    }
    if (data.allow_null == "1") {
      data.is_null = true;
    }
    this.handler.editColumn(this.columnObj, data, this.defaultServerResponse.bind(this));
  }
}

global.Dialog.EditColumn = EditColumn;
module.exports = EditColumn;
