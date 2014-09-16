global.Panes.Structure = global.Pane.extend({

  renderTab: function(rows, indexes) {
    this.renderViewToPane('structure', 'structure_tab', {rows: rows, indexes: indexes});
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
});