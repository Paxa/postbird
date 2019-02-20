class Info extends Pane {

  renderTab () {
    this.renderViewToPane('info', 'info_tab', {
      source: this.source,
      dumpError: this.dumpError,
      diskUsage: this.diskUsage,
      recordsCount: this.recordsCount,
      relType: this.relType,
      summaryError: this.summaryError
    });

    if (this.source) {
      this.content.find('code').forEach(code => {
        window.hljs.highlightBlock(code);
      });
    }

    $u.textContextMenu(this.content);
  }

  updateSource(source, dumpError) {
    this.source = source;
    this.dumpError = dumpError;
  }

  updateSummary(result, summaryError) {
    this.relType = result.type;
    this.recordsCount = result.estimateCount;
    this.diskUsage = result.diskUsage;
    this.summaryError = summaryError;
  }
}

module.exports = Info;
