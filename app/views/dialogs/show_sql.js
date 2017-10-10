class ShowSql extends Dialog {

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

global.Dialog.ShowSql = ShowSql;
module.exports = ShowSql;
