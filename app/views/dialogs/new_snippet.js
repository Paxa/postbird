var fs = require('fs');
var path = require('path');

class NewSnippet extends DialogBase {
  /*::
  code: string
  */

  constructor (code) {
    super(null, {
      dialogClass: 'new-snippet-dialog',
      title: 'New Snippet',
      code: code
    });

    this.showWindow();
  }

  showWindow() {
    const nodes = App.renderView('dialogs/new_snippet', {code: this.code});
    this.content = this.renderWindow(this.title, nodes);
    window.hljs.highlightBlock(this.content.find('code')[0]);

    this.bindFormSubmitting();
  }

  onSubmit (data) {
    if (!data.snippet_name) {
      return $u.alert('A Snippet name is required!');
    }

    const snippetsPath = path.join(electron.remote.app.getPath('userData'), 'custom_snippets.json');

    let customSnippets = {};

    if (fs.existsSync(snippetsPath)) {
      customSnippets = JSON.parse(fs.readFileSync(snippetsPath))
    }

    customSnippets[data.snippet_name] = {
      description: data.description,
      sql: this.code
    };

    console.log(`${data.snippet_name} saved to ${snippetsPath}`);

    fs.writeFileSync(snippetsPath, JSON.stringify(customSnippets, null, 2));

    this.close();
  }
}

/*::
declare var NewSnippet__: typeof NewSnippet
*/
module.exports = NewSnippet;
