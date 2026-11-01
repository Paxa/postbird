class ShowSql extends DialogBase {
  
  code: string
  
  constructor (title, code) {
    if (code === undefined && typeof title === 'string') {
      code = title;
      title = "SQL Preview";
    }
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
    var codeBlock = this.content.find('code')[0];
    if (codeBlock && window.hljs && typeof window.hljs.highlightBlock === 'function') {
      window.hljs.highlightBlock(codeBlock);
    }
  }
}


declare var ShowSql__: typeof ShowSql

module.exports = ShowSql;
