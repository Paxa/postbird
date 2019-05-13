class Info extends PaneBase {

  /*::
  source: string
  dumpError: string
  diskUsage: Table_DiskUsage
  recordsCount: number
  relType: string
  summaryError: string
  */

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

  updateSummary(result, summaryError /*::? : string */) {
    this.relType = result.type;
    this.recordsCount = result.estimateCount;
    this.diskUsage = result.diskUsage;
    this.summaryError = summaryError;
  }
}

/*::
declare var Info__: typeof Info
*/

module.exports = Info;
