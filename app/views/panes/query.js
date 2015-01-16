global.Panes.Query = global.Pane.extend({
  renderTab: function(rows) {
    if (this.content) return;

    window.CodeMirror.commands.autocomplete = function(cm) {
      window.CodeMirror.showHint(cm, window.CodeMirror.hint.sql);
    };

    this.renderViewToPane('query', 'query_tab');

    this.button = this.content.find('button');

    this.mime = 'text/x-mariadb';
    this.textarea = this.content.find('textarea.editor');

    this.editor = window.CodeMirror.fromTextArea(this.textarea[0], {
      mode: this.mime,
      indentWithTabs: false,
      smartIndent: true,
      lineNumbers: true,
      matchBrackets : true,
      autofocus: true,
      styleActiveLine: true,
      tabSize: 2,
      theme: 'mac-classic',
      extraKeys: {"Esc": "autocomplete"}
    });

    this.editor.on("cursorActivity", this.toggleButtonText.bind(this));

    this.setUnchangable();
    this.statusLine = this.content.find('.result .status');
  },

  toggleButtonText: function () {
    var runLabel = "Run query";
    var selectedLabel = "Run selection";

    var selectedText = this.editor.getSelection();
    if (selectedText && selectedText != "") {
      this.button.text(selectedLabel);
    } else {
      this.button.text(runLabel);
    }
  },

  runQuery: function () {
    this.editor.save();
    this.statusLine.text('');

    var selectedText = this.editor.getSelection();

    var sql = selectedText || this.textarea.val();

    this.handler.connection.query(sql, function (data, error) {
      if (error) {
        var message = error.message;
        if (message == "invalid message format") message += ". It can be if too many records, try add 'limit'";
        this.statusLine.text(message);
      } else {
        var node = App.renderView('db_rows_table', {data: data})[0];
        this.content.find('.result table').replaceWith(node);
        this.statusLine.text("Found rows: " + data.rowCount + ' in ' + data.time + 'ms.');
        this.initTables();
      }
    }.bind(this));
  }
});