require('./test_helper');
require('../app/views/panes/base');
require('../app/views/dialogs/base');

const QueryPane = require('../app/views/panes/query');

describe('Query Tab Redesign & Multi-Buffer UI', () => {

  it('renders the redesigned template with bubbles, layout switcher, and AI panel', () => {
    const template = App.renderView('query_tab');
    const html = $u('<div>').append(template).html();

    assert(html.includes('query-workspace'), 'Must have .query-workspace container');
    assert(html.includes('query-main-panel'), 'Must have .query-main-panel');
    assert(html.includes('query-bubbles-container'), 'Must have floating .query-bubbles-container');
    assert(html.includes('layout-switcher'), 'Must have .layout-switcher');
    assert(html.includes('layout-split'), 'Must have split layout button');
    assert(html.includes('layout-editor'), 'Must have full-editor layout button');
    assert(html.includes('layout-results'), 'Must have full-results layout button');
    assert(html.includes('ai-toggle-btn'), 'Must have .ai-toggle-btn');
    assert(html.includes('query-ai-panel'), 'Must have .query-ai-panel container');
    assert(html.includes('ai-panel-resizer'), 'Must have .ai-panel-resizer drag handle');
    assert(html.includes('ai-mode-switcher'), 'Must have AI mode switcher (SQL vs Analyst)');
  });

  it('restores saved AI panel width on initAiPanelResize', () => {
    window.localStorage.setItem('postbird_ai_panel_width', '480');
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);
    query.content = $u(App.renderView('query_tab'));
    query.editor = { refresh: () => {} } as any;

    query.initAiPanelResize();
    assert.equal(query.aiPanelWidth, 480);
    window.localStorage.removeItem('postbird_ai_panel_width');
  });

  it('initializes query buffers with Model.LastQuery content', () => {
    window.localStorage.removeItem('postbird_query_buffers');
    window.localStorage.removeItem('postbird_active_buffer_id');
    Model.LastQuery.save('SELECT 42 AS answer;');

    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);

    // Mock minimal editor and DOM
    query.content = $u(App.renderView('query_tab'));
    query.editor = {
      setValue: (val: string) => { (query as any)._val = val; },
      getValue: () => (query as any)._val || '',
      refresh: () => {},
      focus: () => {},
      on: () => {},
      lineCount: () => 1,
      setCursor: () => {}
    } as any;
    query.statusLine = query.content.find('.result .status');

    query.initQueryBuffers();

    assert.equal(query.queryBuffers.length, 1);
    assert.equal(query.queryBuffers[0].sql, 'SELECT 42 AS answer;');
    assert.equal(query.activeBufferId, query.queryBuffers[0].id);
    assert.equal((query as any)._val, 'SELECT 42 AS answer;');
  });

  it('supports adding, switching, and closing query buffers', () => {
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);

    query.content = $u(App.renderView('query_tab'));
    query.editor = {
      setValue: (val: string) => { (query as any)._val = val; },
      getValue: () => (query as any)._val || '',
      refresh: () => {},
      focus: () => {},
      on: () => {},
      lineCount: () => 1,
      setCursor: () => {}
    } as any;
    query.statusLine = query.content.find('.result .status');

    query.initQueryBuffers();
    query.editor.setValue('SELECT 1;');
    assert.equal(query.queryBuffers.length, 1);

    // Add new buffer
    query.addNewQueryBuffer();
    assert.equal(query.queryBuffers.length, 2);
    const secondId = query.activeBufferId;
    query.editor.setValue('SELECT 2;');

    // Switch back to first buffer
    const firstId = query.queryBuffers[0].id;
    query.switchQueryBuffer(firstId);
    assert.equal(query.activeBufferId, firstId);
    assert.equal(query.editor.getValue(), 'SELECT 1;');

    // Switch back to second buffer
    query.switchQueryBuffer(secondId);
    assert.equal(query.editor.getValue(), 'SELECT 2;');

    // Closing buffer
    query.closeQueryBuffer(secondId);
    assert.equal(query.queryBuffers.length, 1);
    assert.equal(query.activeBufferId, firstId);

    // Duplicate buffer
    query.duplicateQueryBuffer(firstId);
    assert.equal(query.queryBuffers.length, 2);
    assert.equal(query.editor.getValue(), 'SELECT 1;');
    const dupId = query.activeBufferId;

    // Close other buffers
    query.closeOtherQueryBuffers(dupId);
    assert.equal(query.queryBuffers.length, 1);
    assert.equal(query.activeBufferId, dupId);

    // Closing the only remaining buffer should be ignored
    query.closeQueryBuffer(dupId);
    assert.equal(query.queryBuffers.length, 1);
  });

  it('switches between split, editor, and results layout modes', () => {
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);

    query.content = $u(App.renderView('query_tab'));
    query.editor = { refresh: () => {} } as any;

    const mainPanel = query.content.find('.query-main-panel');

    query.setLayout('editor');
    assert.equal(query.currentLayout, 'editor');
    assert(mainPanel.hasClass('layout-editor'));
    assert(!mainPanel.hasClass('layout-results'));

    query.setLayout('results');
    assert.equal(query.currentLayout, 'results');
    assert(mainPanel.hasClass('layout-results'));
    assert(!mainPanel.hasClass('layout-editor'));

    query.setLayout('split');
    assert.equal(query.currentLayout, 'split');
    assert(!mainPanel.hasClass('layout-editor'));
    assert(!mainPanel.hasClass('layout-results'));
  });

  it('clamps resizer dragging between minEditor and maxEditor', () => {
    require('../lib/query_tab_resizer');
    const container = $u('<div><div class="editing" style="height:200px"></div><div class="middlebar"><div class="resizer"></div></div><div class="result" style="height:200px"></div></div>');
    const resizer = new (window as any).QueryTabResizer(container, { refresh: () => {} });
    resizer.element[0].clientHeight = 500;

    // Drag above boundary (small pageY)
    resizer.topOffset = 50;
    resizer.dragOffset = 0;
    resizer.onChanged({ pageY: 10 });
    assert.equal(resizer.editor[0].style.height, '80px', 'Should clamp to minEditor 80px');

    // Drag below boundary (large pageY)
    resizer.onChanged({ pageY: 1000 });
    // totalHeight (500) - minResult (60) - 42 = 398px
    assert.equal(resizer.editor[0].style.height, '398px', 'Should clamp to maxEditor 398px');
  });

  it('toggles AI assistant panel and switches between SQL and Analyst modes', () => {
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);

    query.content = $u(App.renderView('query_tab'));
    query.editor = { refresh: () => {} } as any;

    assert.equal(query.aiPanelOpen, false);
    query.toggleAiPanel();
    assert.equal(query.aiPanelOpen, true);
    query.toggleAiPanel();
    assert.equal(query.aiPanelOpen, false);

    query.setAiMode('agent');
    assert.equal(query.aiMode, 'agent');
    query.setAiMode('sql');
    assert.equal(query.aiMode, 'sql');
  });

  it('persists and restores AI chat history up to 30 messages in localStorage', () => {
    window.localStorage.removeItem('postbird_ai_chat_history');
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);
    query.content = $u(App.renderView('query_tab'));

    // Save 35 messages
    for (let i = 1; i <= 35; i++) {
      query.saveAiChatMessage({
        role: i % 2 === 1 ? 'user' : 'assistant',
        content: `Message ${i}`,
        mode: 'sql'
      });
    }

    assert.equal(query.aiChatHistory.length, 30, 'Must cap history at 30 messages');
    assert.equal(query.aiChatHistory[0].content, 'Message 6', 'Should discard oldest 5 messages');
    assert.equal(query.aiChatHistory[29].content, 'Message 35');

    const stored = JSON.parse(window.localStorage.getItem('postbird_ai_chat_history') || '[]');
    assert.equal(stored.length, 30);
    assert.equal(stored[stored.length - 1].content, 'Message 35');

    // Test restoring into DOM
    const query2 = new QueryPane(mockView);
    query2.content = $u(App.renderView('query_tab'));
    const body = query2.content.find('.ai-panel-body');
    query2.loadAiChatHistory();

    assert.equal(query2.aiChatHistory.length, 30, 'Should load 30 messages into state');
    assert.equal(query2.aiChatHistory[29].content, 'Message 35');
    assert(body.html().includes('Message 35'), 'Should render restored messages');

    // Test clearAiChatHistory
    query2.clearAiChatHistory();
    assert.equal(query2.aiChatHistory.length, 0);
    assert.equal(window.localStorage.getItem('postbird_ai_chat_history'), null);
    assert(body.html().includes('ai-empty-state'), 'Should restore empty state');
  });

  it('formats markdown text and renders code blocks with action buttons', () => {
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);
    query.content = $u(App.renderView('query_tab'));

    const formatted = query.formatMarkdownText('Use `SELECT * FROM users;` and **bold** text.');
    assert(formatted.includes('<code>SELECT * FROM users;</code>'));
    assert(formatted.includes('<strong>bold</strong>'));

    const container = $u('<div></div>');
    const md = 'Here is the query:\n```sql\nSELECT id, name FROM users;\n```\nExplanation follows.';
    query.renderAiMessageContent(container, md, 'sql');

    const html = container.html();
    assert(html.includes('ai-code-block'), 'Should create code block');
    assert(html.includes('code-act-insert'), 'Should have Insert button');
    assert(html.includes('code-act-replace'), 'Should have Replace button');
    assert(html.includes('code-act-run'), 'Should have Run button');
  });

  it('renders staged remediation queries with Stage in SQL Editor button', () => {
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);
    query.content = $u(App.renderView('query_tab'));

    const container = $u('<div></div>');
    const md = 'Remediation plan:\n```sql:stage\nDELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users);\n```';
    query.renderAiMessageContent(container, md, 'sql');

    const html = container.html();
    assert(html.includes('ai-stage-box'), 'Should create staged box');
    assert(html.includes('stage-in-editor-btn'), 'Should have Stage in SQL Editor button');
    assert(html.includes('DELETE FROM orders'), 'Should include staged SQL');
  });

  it('loads query into left editor and can create a staged buffer', () => {
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);
    query.content = $u(App.renderView('query_tab'));
    query.editor = {
      setValue: (val: string) => { (query as any)._val = val; },
      getValue: () => (query as any)._val || '',
      refresh: () => {},
      focus: () => {}
    } as any;
    query.statusLine = query.content.find('.result .status');
    query.initQueryBuffers();

    // Test loadQueryIntoLeft
    query.setLayout('results');
    query.loadQueryIntoLeft('SELECT * FROM products;', false);
    assert.equal(query.currentLayout, 'split', 'Should restore split layout');
    assert.equal(query.editor.getValue(), 'SELECT * FROM products;');

    // Test addBufferWithSql
    const initialBufferCount = query.queryBuffers.length;
    query.addBufferWithSql('ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);');
    assert.equal(query.queryBuffers.length, initialBufferCount + 1, 'Should add new buffer');
    assert.equal(query.editor.getValue(), 'ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);');
  });

  it('executes Analyst mode loop: runs read-only inspection and stages fix', async () => {
    const executedQueries: string[] = [];
    const mockConnection: any = {
      connection: true,
      options: { database: 'shop_db' },
      queryWithOptions: async (sql: string, opts: any) => {
        executedQueries.push(sql);
        return {
          rows: [['101', 'orphan_order']],
          rowCount: 1,
          fields: [{ name: 'id' }, { name: 'title' }]
        };
      }
    };

    const mockView: any = {
      handler: {
        database: 'shop_db',
        currentSchema: 'public',
        currentTable: 'orders',
        connection: mockConnection
      }
    };

    const query = new QueryPane(mockView);
    query.content = $u(App.renderView('query_tab'));
    query.editor = {
      setValue: (val: string) => { (query as any)._val = val; },
      getValue: () => '',
      getSelection: () => '',
      refresh: () => {},
      focus: () => {}
    } as any;
    query.statusLine = query.content.find('.result .status');
    query.initQueryBuffers();

    // Mock getAiConnector to simulate 2-turn assistant response
    let callIndex = 0;
    query.getAiConnector = () => ({
      chat: async (messages: any[]) => {
        callIndex++;
        if (callIndex === 1) {
          return {
            content: `I will check for orphan orders.\n\`\`\`sql:execute\nSELECT id, title FROM orders WHERE user_id NOT IN (SELECT id FROM users);\n\`\`\``
          };
        } else {
          return {
            content: `Found 1 orphan order.\n\`\`\`sql:stage\nDELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users);\n\`\`\`\nAnalysis complete.`
          };
        }
      }
    });

    const body = query.content.find('.ai-panel-body');
    await query.executeAnalystMode('Find broken foreign keys in orders', body);

    assert.equal(executedQueries.length, 1, 'Should have executed 1 inspection query');
    assert(executedQueries[0].includes('SELECT id, title FROM orders'), 'Inspection query executed');

    const html = body.html();
    assert(html.includes('ai-step-card'), 'Should render step cards');
    assert(html.includes('ai-stage-box'), 'Should render staged fix box');
    assert(html.includes('DELETE FROM orders'), 'Should include remediation query in stage box');
  });

  it('blocks mutating queries from auto-execution in Analyst mode for safety', async () => {
    let executed = false;
    const mockConnection: any = {
      connection: true,
      options: { database: 'shop_db' },
      queryWithOptions: async (sql: string, opts: any) => {
        executed = true;
        return { rows: [], rowCount: 0 };
      }
    };

    const mockView: any = {
      handler: {
        database: 'shop_db',
        connection: mockConnection
      }
    };

    const query = new QueryPane(mockView);
    query.content = $u(App.renderView('query_tab'));
    query.editor = {
      setValue: () => {},
      getValue: () => '',
      getSelection: () => '',
      refresh: () => {},
      focus: () => {}
    } as any;
    query.statusLine = query.content.find('.result .status');
    query.initQueryBuffers();

    // Assistant mistakenly puts an UPDATE in sql:execute
    query.getAiConnector = () => ({
      chat: async () => ({
        content: `Fixing data directly:\n\`\`\`sql:execute\nUPDATE users SET active = false;\n\`\`\``
      })
    });

    const body = query.content.find('.ai-panel-body');
    await query.executeAnalystMode('Fix users', body);

    assert.equal(executed, false, 'Mutating query must NOT be executed automatically');
    const html = body.html();
    assert(html.includes('Security Blocked'), 'Should show security blocked status');
  });

  it('Dialog.AiSettings auto-selects agy and marks fm as needs_setup', async () => {
    window.localStorage.removeItem('postbird_ai_config');
    const origAlertify = window.alertify;
    window.alertify = { alert: () => {} } as any;

    const AiSettingsDialog = require('../app/views/dialogs/ai_settings');
    const origRender = AiSettingsDialog.prototype.renderWindow;
    AiSettingsDialog.prototype.renderWindow = function(title: any, nodes: any) {
      return $u('<div>').append(nodes);
    };

    try {
      const dialog = new AiSettingsDialog({} as any);
      await dialog.loadProviders();

      assert.equal(dialog.selectedProviderId, 'agy', 'Should auto-select top detected CLI agy');
      const fm = dialog.providers.find((p: any) => p.id === 'fm');
      if (fm) {
        assert(fm.status === 'ready' || fm.status === 'needs_setup', 'fm should be discovered on macOS');
      }
      const agy = dialog.providers.find((p: any) => p.id === 'agy');
      assert(agy, 'agy should be present in providers list');
      assert.equal(agy.status, 'ready');

      const googleStudio = dialog.providers.find((p: any) => p.id === 'google-ai-studio');
      assert(googleStudio, 'google-ai-studio preset should be present in providers list');
      assert.equal(googleStudio.baseUrl, 'https://generativelanguage.googleapis.com/v1beta/openai');

      assert(dialog.content.find('.ai-test-btn').length > 0, 'Dialog must have .ai-test-btn');
    } finally {
      window.alertify = origAlertify;
      AiSettingsDialog.prototype.renderWindow = origRender;
    }
  });

  it('provides table names list and selected table columns upfront, and fetches other tables on demand via sql:inspect_schema', async () => {
    const mockConnection: any = {
      connection: true,
      options: { database: 'commerce_db' },
      query: async (sql: string) => {
        if (sql.includes('FROM information_schema.tables')) {
          return {
            rows: [
              { table_name: 'customers' },
              { table_name: 'orders' },
              { table_name: 'order_items' }
            ]
          };
        }
        if (sql.includes('FOREIGN KEY')) {
          return {
            rows: [
              {
                table_name: 'orders',
                column_name: 'customer_id',
                foreign_table_name: 'customers',
                foreign_column_name: 'id'
              }
            ]
          };
        }
        if (sql.includes('FROM information_schema.columns')) {
          if (sql.includes("'customers'") && !sql.includes("'orders'")) {
            return {
              rows: [
                { table_name: 'customers', column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
                { table_name: 'customers', column_name: 'email', data_type: 'varchar', is_nullable: 'NO' }
              ]
            };
          }
          return {
            rows: [
              { table_name: 'orders', column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
              { table_name: 'orders', column_name: 'customer_id', data_type: 'integer', is_nullable: 'NO' },
              { table_name: 'orders', column_name: 'total_amount', data_type: 'numeric', is_nullable: 'YES' }
            ]
          };
        }
        return { rows: [] };
      }
    };

    const mockView: any = {
      handler: {
        database: 'commerce_db',
        currentSchema: 'public',
        currentTable: 'customers',
        connection: mockConnection
      }
    };

    const query = new QueryPane(mockView);
    query.content = $u(App.renderView('query_tab'));
    query.editor = {
      setValue: () => {},
      getValue: () => '',
      getSelection: () => '',
      refresh: () => {},
      focus: () => {}
    } as any;

    const ctx = await query.getDatabaseContext();
    assert(ctx.includes('Available Tables in "public" (3): customers, orders, order_items'), 'Context should list table names');
    assert(ctx.includes('Currently Selected Table: "customers"'), 'Context should identify selected table');
    assert(ctx.includes('Columns of "customers": id (integer, NOT NULL), email (varchar, NOT NULL)'), 'Context should include selected table columns');
    assert(!ctx.includes('total_amount'), 'Context must NOT dump columns of unselected tables upfront');

    // Now test on-demand sql:inspect_schema in executeSqlMode
    let streamTurn = 0;
    let capturedMessagesOnTurn2: any[] = [];
    query.getAiConnector = () => ({
      chatStream: async (messages: any[], _opts: any, onChunk: (c: string) => void) => {
        streamTurn++;
        if (streamTurn === 1) {
          const reply = '```sql:inspect_schema\norders\n```';
          onChunk(reply);
          return reply;
        } else {
          capturedMessagesOnTurn2 = [...messages];
          const reply = '```sql\nSELECT c.email, SUM(o.total_amount) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.email;\n```';
          onChunk(reply);
          return reply;
        }
      }
    });

    const body = query.content.find('.ai-panel-body');
    await query.executeSqlMode('Show total spent per customer email', body);

    assert.equal(streamTurn, 2, 'Should perform 2 turns: 1st to request orders schema, 2nd to output final SQL');
    const lastUserMsg = capturedMessagesOnTurn2[capturedMessagesOnTurn2.length - 1].content;
    assert(lastUserMsg.includes('Columns of "orders": id (integer, NOT NULL), customer_id (integer, NOT NULL -> customers.id), total_amount (numeric)'), 'Second turn should receive inspected orders columns and foreign key');
    assert(body.html().includes('Loaded structure for: orders'), 'UI should show loaded structure badge');
    assert(body.html().includes('SUM(o.total_amount)'), 'UI should render final SQL query');
  });

  it('formats markdown with tables, lists, and headings in AI chat', () => {
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);

    const md = [
      '### Proposed Schema Changes',
      '',
      '| # | Problem | Fix |',
      '|---|---|---|',
      '| 1 | Duplicated rows | Add unique constraint |',
      '| 2 | Missing index | Create btree index |',
      '',
      '- First item',
      '- Second item'
    ].join('\n');

    const html = query.formatMarkdownText(md);
    assert(html.includes('<table'), 'Must render markdown table element');
    assert(html.includes('<th>Problem</th>'), 'Must render table header cell');
    assert(html.includes('<td>Duplicated rows</td>'), 'Must render table data cell');
    assert(html.includes('<ul>') && html.includes('<li>First item</li>'), 'Must render list items');
    assert(html.includes('<h3') || html.includes('<h4'), 'Must render headings');
  });

  it('formats message title tooltip with time, provider, tokens, and duration', () => {
    const mockView: any = { handler: { connection: {} } };
    const query = new QueryPane(mockView);

    // Test fixed timestamp: 2026-11-05 20:33:00
    const testDate = new Date(2026, 10, 5, 20, 33, 0);
    const title = query.formatMessageTitle({
      timestamp: testDate.getTime(),
      provider: 'claude',
      tokens: 1400,
      durationMs: 30000
    });

    assert.equal(title, '20:33 5 nov 2026 - claude 1,400 tok, processed in 30s');

    // Test user message title
    const userTitle = query.formatMessageTitle({
      timestamp: testDate.getTime(),
      tokens: 42,
      isUser: true
    });
    assert.equal(userTitle, '20:33 5 nov 2026 - 42 tok');
  });

});

export {};
