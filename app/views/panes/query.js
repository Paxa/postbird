global.Panes.Query = global.Pane.extend({
  renderTab: function(rows) {
    if (this.content) return;

    this.renderViewToPane('query', 'query_tab');

    this.mime = 'text/x-plsql';
    this.textarea = this.content.find('textarea.editor');
    this.textarea.val(" \
    -- SQL Mode for CodeMirror \n\
    SELECT SQL_NO_CACHE DISTINCT \n\
      @var1 AS `val1`, @'val2', @global.'sql_mode', \n\
      1.1 AS `float_val`, .14 AS `another_float`, 0.09e3 AS `int_with_esp`, \n\
      0xFA5 AS `hex`, x'fa5' AS `hex2`, 0b101 AS `bin`, b'101' AS `bin2`, \n\
      DATE '1994-01-01' AS `sql_date`, { T \"1994-01-01\" } AS `odbc_date`, \n\
      'my string', _utf8'your string', N'her string', \n\
            TRUE, FALSE, UNKNOWN \n\
      FROM DUAL \n\
      -- space needed after '--' \n\
      # 1 line comment \n\
      /* multiline \n\
      comment! */ \n\
      LIMIT 1 OFFSET 0; \n\
    ");

    this.editor = window.CodeMirror.fromTextArea(this.textarea[0], {
      mode: this.mime,
      indentWithTabs: false,
      smartIndent: true,
      lineNumbers: true,
      matchBrackets : true,
      autofocus: true,
      theme: 'paraiso-light'
    });
  }
});