class ShowSql extends DialogBase {
  
  code: string
  
  constructor (title, code) {
    if (code === undefined && typeof title === 'string') {
      code = title;
      title = "SQL Preview";
    }
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
    var codeBlock = this.content.find('code')[0];
    if (codeBlock && window.hljs && typeof window.hljs.highlightBlock === 'function') {
      window.hljs.highlightBlock(codeBlock);
    }

    this.content.find('button.copy-sql').bind('click', (e) => {
      e && e.preventDefault();
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(this.code);
        } else if (electronRemote && electronRemote.clipboard) {
          electronRemote.clipboard.writeText(this.code);
        }
        var btn = $u(e.currentTarget);
        btn.text("Copied!");
        setTimeout(() => { btn.text("Copy"); }, 1500);
      } catch (err) {
        console.error("Failed to copy SQL:", err);
      }
    });

    const runExplain = (analyze: boolean) => {
      const conn = App.currentTab?.instance?.connection || (global as any).ModelBase?.connection();
      if (!conn) {
        $u.alertError("No active database connection available for EXPLAIN");
        return;
      }

      const planContainer = this.content.find('.explain-plan-container');
      const planOutput = this.content.find('.explain-plan-output');
      const planStatus = this.content.find('.explain-status');

      planContainer.show();
      planStatus.text(analyze ? 'Running EXPLAIN ANALYZE in safe transaction...' : 'Calculating execution plan...');
      planOutput.text('Loading execution plan...');

      // Clean query (strip trailing semicolon)
      let cleanQuery = this.code.trim().replace(/;+$/, '');

      let explainQuery = `EXPLAIN (BUFFERS) ${cleanQuery};`;
      if (analyze) {
        explainQuery = `BEGIN; EXPLAIN (ANALYZE, BUFFERS) ${cleanQuery}; ROLLBACK;`;
      }

      conn.query(explainQuery, (res: any, error: any) => {
        if (error) {
          planStatus.text('Error');
          planOutput.text(`EXPLAIN failed:\n${error.message || String(error)}`);
        } else {
          planStatus.text(analyze ? 'Completed (EXPLAIN ANALYZE)' : 'Completed (EXPLAIN)');
          let explainRows: any[] = [];
          if (Array.isArray(res)) {
            const explainResult = res.find((r: any) => r.command === 'EXPLAIN');
            explainRows = explainResult ? explainResult.rows : (res[1]?.rows || []);
          } else {
            explainRows = res.rows || [];
          }

          const planLines = explainRows.map((r: any) => r['QUERY PLAN'] || Object.values(r)[0]).join('\n');
          planOutput.text(planLines || 'No plan output returned');
        }
      });
    };

    this.content.find('.btn-explain-plan').bind('click', (e) => {
      e && e.preventDefault();
      runExplain(false);
    });

    this.content.find('.btn-explain-analyze').bind('click', (e) => {
      e && e.preventDefault();
      runExplain(true);
    });

    this.content.find('.btn-open-query-tab').bind('click', (e) => {
      e && e.preventDefault();
      const tab = App.currentTab?.instance;
      if (tab) {
        if (tab.currentTab !== 'query') {
          tab.view.showTab('query');
        }
        if (tab.view.queryPane && tab.view.queryPane.editor) {
          tab.view.queryPane.editor.setValue(this.code);
        }
        this.close();
      }
    });
  }
}


declare var ShowSql__: typeof ShowSql

module.exports = ShowSql;
