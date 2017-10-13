class Structure extends Pane {

  renderTab (columns, indexes, constraints, extra = {}) {
    var neededConstraints = [];
    this.constraints = constraints ? constraints.rows : [];
    this.constraints.forEach((constraint) => {
      if (constraint.contype != "p") {
        neededConstraints.push(constraint);
      }
    });

    this.renderViewToPane('structure', 'structure_tab', {
      columns: columns,
      indexes: indexes,
      constraints: neededConstraints,
      isMatView: extra.isMatView,
      indexesError: extra.indexesError,
      columnsError: extra.columnsError,
      constraintsError: extra.constraintsError
    });
    this.initTables();
  }

  addColumnForm () {
    new Dialog.NewColumn(this.handler);
  }

  addIndexForm () {
    new Dialog.NewIndex(this.handler);
  }

  editColumn (column_name) {
    new Dialog.EditColumn(this.handler, column_name);
  }

  deleteColumn (column_name) {
    var msg = `Delete column <b>${column_name}</b>?`;
    window.alertify.confirm(msg, (result) => {
      if (result) {
        this.doDeleteColumn(column_name);
      }
    });
  }

  doDeleteColumn (column_name) {
    this.handler.deleteColumn(column_name, (result, error) => {
      if (error) window.alert(error.message);
    });
  }

  deleteIndex (indexName) {
    var msg = `Delete index <b>${indexName}</b>?`;
    window.alertify.confirm(msg, (result) => {
      if (result) {
        this.doDeleteIndex(indexName);
      }
    });
  }

  doDeleteIndex (indexName) {
    this.handler.deleteIndex(indexName, (result, error) => {
      if (error) window.alert(error.message);
    });
  }

  deleteConstraint (constraintName) {
    var msg = `Delete constraint <b>${constraintName}</b>?`;
    var constraint = this.constraints.find((c) => { return c.conname == constraintName; });
    if (constraint) msg = msg + `<br><code>${constraint.pretty_source}</code>`;
    window.alertify.confirm(msg, (result) => {
      if (result) {
        this.handler.deleteConstraint(constraintName, (result, error) => {
          if (error) window.alert(error.message);
        });
      }
    });
  }
}

module.exports = Structure;
