global.Panes.Query = global.Pane.extend({
  renderTab: function(rows) {
    if (this.content) return;

    window.CodeMirror.commands.autocomplete = function(cm) {
      window.CodeMirror.showHint(cm, window.CodeMirror.hint.sql);
    };

    this.renderViewToPane('query', 'query_tab');

    this.button = this.content.find('button');

    this.mime = 'text/x-pgsql';
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

    if (Model.LastQuery.load()) {
      this.editor.setValue(Model.LastQuery.load());
    }

    this.editor.on("cursorActivity", this.toggleButtonText.bind(this));
    this.editor.on("change", this.saveLastQuery.bind(this));

    this.editor.focus();

    this.setUnchangeable();
    this.statusLine = this.content.find('.result .status');

    new QueryTabResizer(this.content, this.editor);
  },

  saveLastQuery: function () {
    var value = this.editor.getValue();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(function () {
      Model.LastQuery.save(value);
      delete this.saveTimeout;
    }.bind(this), 700);

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
    var tableRegex = /(create|drop)\s+((GLOBAL|LOCAL|TEMPORARY|TEMP|UNLOGGED|FOREIGN|MATERIALIZED)\s+)*\s*(table|schema|view)/im;
    var needReloadTables = !!sql.match(tableRegex);

    this.handler.connection.query(sql, function (data, error) {
      if (error) {
        this.content.find('.result .JCLRgrips').remove();
        this.content.find('.result table').html("").hide();
        var message = error.message;
        if (message == "invalid message format") message += ". It can be if too many records, try add 'limit'";
        this.statusLine.text(message);
      } else {
        var node = App.renderView('db_rows_table', {data: data})[0];
        this.content.find('.result .JCLRgrips').remove();
        this.content.find('.result table').replaceWith(node);

        var footerText = `Found ${data.rowCount} ${data.rowCount > 1 ? 'rows' : 'row'} in ${data.time}ms.`;
        this.statusLine.text(footerText);
        this.initTables();
      }
      if (needReloadTables) {
        this.reloadTables();
      }
      this.editor.focus();
    }.bind(this));
  },

  reloadTables: function () {
    this.handler.fetchTablesAndSchemas();
  }
});
