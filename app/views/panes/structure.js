global.Panes.Structure = global.Pane.extend({

  renderTab: function(columns, indexes, constraints, extra = {}) {
    this.constraints = constraints.rows;
    var neededConstraints = [];
    if (constraints.rows) {
      constraints.rows.forEach((constraint) => {
        if (constraint.contype != "p") {
          neededConstraints.push(constraint);
        }
      });
    }
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
  },

  addColumnForm: function () {
    new Dialog.NewColumn(this.handler);
  },

  addIndexForm: function () {
    new Dialog.NewIndex(this.handler);
  },

  editColumn: function (column_name) {
    new Dialog.EditColumn(this.handler, column_name);
  },

  deleteColumn: function (column_name) {
    var msg = `Delete column <b>${column_name}</b>?`;
    window.alertify.confirm(msg, (result) => {
      if (result) {
        this.doDeleteColumn(column_name);
      }
    });
  },

  doDeleteColumn: function (column_name) {
    this.handler.deleteColumn(column_name, (result, error) => {
      if (error) window.alert(error.message);
    });
  },

  deleteIndex: function (indexName) {
    var msg = `Delete index <b>${indexName}</b>?`;
    window.alertify.confirm(msg, (result) => {
      if (result) {
        this.doDeleteIndex(indexName);
      }
    });
  },

  doDeleteIndex: function (indexName) {
    this.handler.deleteIndex(indexName, (result, error) => {
      if (error) window.alert(error.message);
    });
  },

  deleteConstraint: function (constraintName) {
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
});