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

    this.content.find('button.copy-sql').bind('click', (e) => {
      e && e.preventDefault();
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(this.code);
        } else if (electronRemote && electronRemote.clipboard) {
          electronRemote.clipboard.writeText(this.code);
        }
        var btn = $u(e.currentTarget);
        btn.text("Copied!");
        setTimeout(() => { btn.text("Copy"); }, 1500);
      } catch (err) {
        console.error("Failed to copy SQL:", err);
      }
    });
  }
}


declare var ShowSql__: typeof ShowSql

module.exports = ShowSql;
