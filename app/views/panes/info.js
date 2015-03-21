global.Panes.Info = global.Pane.extend({
  renderTab: function(code, relType, recordsCount, tableSize) {
    this.renderViewToPane('info', 'info_tab', {
      code: code,
      tableSize: tableSize,
      recordsCount: recordsCount,
      relType: relType
    });

    window.hljs.highlightBlock(this.content.find('code')[0]);
  }
});
