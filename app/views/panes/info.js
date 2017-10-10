global.Panes.Info = global.Pane.extend({
  renderTab: function(source, relType, recordsCount, tableSize) {
    this.renderViewToPane('info', 'info_tab', {
      source: source,
      tableSize: tableSize,
      recordsCount: recordsCount,
      relType: relType
    });

    window.hljs.highlightBlock(this.content.find('code')[0]);
  }
});
