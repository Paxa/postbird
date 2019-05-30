var NewColumnClass = require('./new_column');

class EditColumn extends NewColumnClass {
  /*::
  columnName: string
  columnObj: Model.Column
  */

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
      $u.alert("Please choose column type");
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

/*::
declare var EditColumn__: typeof EditColumn
*/
module.exports = EditColumn;
