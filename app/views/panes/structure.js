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

  deleteColumn: function (column_name) {
    var msg = `Delete column ${column_name}?`;
    var dialog = window.alertify.confirm(msg, function (result) {
      if (result) {
        this.doDeleteColumn(column_name);
      }
    }.bind(this));
  },

  doDeleteColumn: function (column_name) {
    this.handler.deleteColumn(column_name, function (result, error) {
      if (error) window.alert(error.message);
    });
  },

  deleteIndex: function (indexName) {
    var msg = `Delete index ${indexName}?`;
    var dialog = window.alertify.confirm(msg, function (result) {
      if (result) {
        this.doDeleteIndex(indexName);
      }
    }.bind(this));
  },

  doDeleteIndex: function (indexName) {
    this.handler.deleteIndex(indexName, function (result, error) {
      if (error) window.alert(error.message);
    });
  },
});