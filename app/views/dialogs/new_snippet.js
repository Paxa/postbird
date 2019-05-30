var fs = require('fs');
var path = require('path');
//var electron = require('electron');

class NewSnippet extends DialogBase {
  /*::
  code: string
  */

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
      var snippetsPath = path.join(electron.remote.app.getPath('userData'), 'custom_snippets.json');

      var customSnippets = {};
      if (fs.existsSync(snippetsPath)) {
        customSnippets = JSON.parse(fs.readFileSync(snippetsPath))
      }

      customSnippets[data.snippet_name] = {
        description: data.description,
        sql: this.code
      };

      console.log('saving snippet to ', snippetsPath);
      console.log('data', JSON.stringify(customSnippets, null, 2));
      fs.writeFileSync(snippetsPath, JSON.stringify(customSnippets, null, 2));
      this.close();
    }
    else {
      $u.alert('A Snippet name is required!');
    }
  }
}

/*::
declare var NewSnippet__: typeof NewSnippet
*/
module.exports = NewSnippet;
