global.Panes.Structure = global.Pane.extend({

  renderTab: function(rows) {
    //console.log('global.Panes.Structure#renderTab');
    //console.log(rows);
    this.renderViewToPane('structure', 'structure_tab', {rows: rows});
  }

});