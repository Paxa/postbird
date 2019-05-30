class ShowSql extends DialogBase {
  /*::
  code: string
  */
  constructor (title, code) {
    super(null, {
      dialogClass: "show-sql-dialog",
      title: title,
      code: code
    });
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/show_sql', {code: this.code});
    this.content = this.renderWindow(this.title, nodes);
    window.hljs.highlightBlock(this.content.find('code')[0]);
  }
}

/*::
declare var ShowSql__: typeof ShowSql
*/
module.exports = ShowSql;
