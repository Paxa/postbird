global.Dialog.ListLanguages = global.Dialog.extend({
  title: "Languages",
  dialogClass: "list-languages",

  init: function (handler, langs) {
    this.handler = handler;
    this.langs = langs;
    this.showWindow();
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/list_languages', {langs: this.langs});

    this.content = this.renderWindow(this.title, nodes);
  }
});
