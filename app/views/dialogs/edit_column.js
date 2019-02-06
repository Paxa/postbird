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
      this.handler.tableObj().getColumnObj(this.columnName).then(column => {
        this.columnObj = column;
        var nodes = App.renderView('dialogs/column_form', {groupedTypes: groupedTypes, data: column.data, action: "edit"});
        this.content = this.renderWindow(this.title, nodes);
        this.bindFormSubmitting();
      });
    });
  }

  async onSubmit(data) {
    if (data.type == "") {
      window.alert("Please choose column type");
      return;
    }

    try {
      var saved = await this.handler.updateColumn(this.columnObj, data);
      if (saved) {
        this.close();
      }
    } catch (error) {
      this.defaultServerResponse(null, error);
    }
  }
}

global.Dialog.EditColumn = EditColumn;
module.exports = EditColumn;
