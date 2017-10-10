class ListLanguages extends Dialog {

  constructor (handler, langs) {
    super(handler, {
      title: "Languages",
      dialogClass: "list-languages",
      langs: langs
    });
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/list_languages', {langs: this.langs});
    this.content = this.renderWindow(this.title, nodes);
  }
}

global.Dialog.ListLanguages = ListLanguages;
module.exports = ListLanguages;
