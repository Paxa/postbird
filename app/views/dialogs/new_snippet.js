const fs = require('fs');
const customSnippets = require(__dirname + '/../../../public/custom_snippets.json');

class NewSnippet extends Dialog {

  constructor (code) {
    super(null, {
      dialogClass: "new-snippet-dialog",
      title: "New Snippet",
      code: code
    });
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/new_snippet', {code: this.code});
    this.content = this.renderWindow(this.title, nodes);
    window.hljs.highlightBlock(this.content.find('code')[0]);

    this.bindFormSubmitting();
  }

  onSubmit (data) {
    // Apped to json file
    if (data.snippet_name) {
      customSnippets[data.snippet_name] = {
        description: data.description,
        sql: data.sql
      }
      fs.writeFileSync(__dirname + '/../../../public/custom_snippets.json', JSON.stringify(customSnippets));
      this.close();
    }
    else {
      window.alert('A Snippet name is required!')
    }
    

  }
}

global.Dialog.NewSnippet = NewSnippet;
module.exports = NewSnippet;
