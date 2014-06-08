global.Panes.Structure = global.Pane.extend({

  renderTab: function(rows, indexes) {
    //console.log('global.Panes.Structure#renderTab');
    //console.log(rows);
    this.renderViewToPane('structure', 'structure_tab', {rows: rows, indexes: indexes});
  },

  addColumnForm: function () {
    new Dialog.NewColumn(this.handler);
  },

  editColumn: function (column_name) {
    
  },
});