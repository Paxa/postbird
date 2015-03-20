global.Dialog.ShowSql = global.Dialog.extend({
  title: "",
  dialogClass: "show-sql-dialog",

  init: function (title, code) {
    this.title = title;
    this.code = code;
    this.showWindow();
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/show_sql', {code: this.code});
    this.content = this.renderWindow(this.title, nodes);
    window.hljs.highlightBlock(this.content.find('code')[0]);
  }
});
