global.Panes.Structure = global.Pane.extend({

  renderTab: function(rows, indexes, is_mat_view) {
    this.renderViewToPane('structure', 'structure_tab', {rows: rows, indexes: indexes, is_mat_view: is_mat_view});
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