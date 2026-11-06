var fs = require('fs');
var electronRemote = require('@electron/remote');
var localAIConnector = require('../../../lib/local_ai');
var { escapeCsv, toCsvRow, serializeToCsv } = require('../../../lib/csv_util');
var formatUtil: typeof import('../../../lib/format_util') = require('../../../lib/format_util');
var dom: typeof import('../../../lib/dom') = require('../../../lib/dom');
var { marked } = require('marked');


interface Query_ExterndedResults extends QueryResult {
  completeRows: any[]
}

interface QueryBufferItem {
  id: string;
  sql: string;
  resultNode?: HTMLElement | null;
  statusText?: string;
  lastResult?: Query_ExterndedResults | null;
}


class Query extends PaneBase {

  
    button: JQuery<HTMLElement>
    cleanButton: JQuery<HTMLElement>
    saveButton: JQuery<HTMLElement>
    copyButton: JQuery<HTMLElement>
    mime: string
    textarea: JQuery<HTMLElement>
    editor: CodeMirror.EditorFromTextArea
    statusLine: JQuery<HTMLElement>
    saveTimeout: NodeJS.Timer
    lastResult: Query_ExterndedResults
    resizer: QueryTabResizer
    queryBuffers: QueryBufferItem[] = []
    activeBufferId: string = '1'
    currentLayout: 'split' | 'editor' | 'results' = 'split'
    aiPanelOpen: boolean = false
    aiPanelWidth: number = 320
    aiMode: 'sql' | 'agent' = 'sql'
    aiChatHistory: any[] = []
  

  renderTab () {
    if (this.content) return;

    this.renderViewToPane('query', 'query_tab');

    this.button = this.content.find('button[exec="runQuery"], button:first').first();
    this.cleanButton = this.content.find('button.cleanButton');
    this.saveButton = this.content.find('button.saveButton');
    this.copyButton = this.content.find('button.copyButton');

    this.mime = 'text/x-pgsql';
    this.textarea = this.content.find('textarea.editor');

    var textarea =  <HTMLTextAreaElement><any>  this.textarea[0];

    this.editor = window.CodeMirror.fromTextArea(textarea, {
      mode: this.mime,
      indentWithTabs: false,
      smartIndent: true,
      lineNumbers: true,
      matchBrackets: true,
      hint: window.CodeMirror.hint.sql,
      autofocus: true,
      styleActiveLine: true,
      tabSize: 2,
      scrollbarStyle: 'null',
      theme: 'mac-classic',
      extraKeys: {
        "Esc": "autocomplete",
        "Cmd-K": () => this.toggleAiPanel(),
        "Ctrl-K": () => this.toggleAiPanel()
      }
    });

    this.initQueryBuffers();

    this.editor.on("cursorActivity", this.toggleButtonText.bind(this));
    this.editor.on("change", this.saveLastQuery.bind(this));

    this.editor.focus();

    this.setUnchangeable();
    this.statusLine = this.content.find('.result .status');

    this.resizer = new QueryTabResizer(this.content, this.editor);
    this.initAiPanelResize();
    this.loadAiChatHistory();

    this.content.find('.ai-clear-btn').on('click', (e: any) => {
      e.preventDefault();
      this.clearAiChatHistory();
    });

    this.content.find('.ai-prompt-input').on('keydown', (e: any) => {
      if (e.keyCode === 13 || e.key === 'Enter') {
        e.preventDefault();
        this.sendAiPrompt();
      }
    });

    this.content.find('.result').on('click', '.cell-json-badge', (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      var td = $u(e.target).closest('td')[0];
      this.openJsonViewerForCell(td);
    });

    this.bindResultsContextMenu();
  }

  openJsonViewerForCell (td: HTMLElement) {
    if (!td) return;
    var tdEl = $u(td);
    var tr = tdEl.closest('tr');
    var colIndex = tdEl.prevAll('td').length;
    var rowIndex = tr.prevAll('tr').length;

    var field = this.lastResult && this.lastResult.fields ? this.lastResult.fields[colIndex] : null;
    var fieldName = field ? field.name : `Column ${colIndex + 1}`;
    var row = this.lastResult && this.lastResult.rows ? this.lastResult.rows[rowIndex] : null;
    var value = null;
    if (row) {
      value = Array.isArray(row) ? row[colIndex] : row[fieldName];
    }

    new (Dialog as any).JsonViewer(this.handler, {
      fieldName: fieldName,
      fieldType: field ? { data_type: (field as any).dataType || (field as any).format || 'json', udt_name: 'json' } : { data_type: 'json' },
      value: value,
      readOnly: true
    });
  }

  initQueryBuffers () {
    var rawBuffers = window.localStorage.getItem('postbird_query_buffers');
    var parsed: any = null;
    if (rawBuffers) {
      try {
        parsed = JSON.parse(rawBuffers);
      } catch (e) {
        parsed = null;
      }
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      this.queryBuffers = parsed.map((item: any, idx: number) => ({
        id: String(item.id || idx + 1),
        sql: typeof item.sql === 'string' ? item.sql : ''
      }));
    } else {
      var initialSql = Model.LastQuery.load() || '';
      this.queryBuffers = [{ id: '1', sql: initialSql }];
    }

    var savedActive = window.localStorage.getItem('postbird_active_buffer_id');
    var activeItem = this.queryBuffers.find(b => b.id === savedActive) || this.queryBuffers[0];
    this.activeBufferId = activeItem.id;
    this.editor.setValue(activeItem.sql || '');

    this.renderQueryBubbles();
  }

  renderQueryBubbles () {
    var container = this.content.find('.query-bubbles-container');
    if (!container || !container.length) return;

    container.empty();

    this.queryBuffers.forEach((buf, idx) => {
      var bubble = $u('<a class="query-bubble" href="javascript:void(0)"></a>');
      bubble.text(String(idx + 1));
      if (buf.id === this.activeBufferId) {
        bubble.addClass('active');
      }

      var firstLine = (buf.sql || '').trim().split('\n')[0] || `Query ${idx + 1}`;
      bubble.attr('title', `Query ${idx + 1}: ${firstLine.slice(0, 45)} (Right-click for options)`);

      bubble.on('click', (e) => {
        e.preventDefault();
        this.switchQueryBuffer(buf.id);
      });

      var actions: any = {
        'New Tab': () => {
          this.addNewQueryBuffer();
        },
        'Duplicate Tab': () => {
          this.duplicateQueryBuffer(buf.id);
        },
        'Copy SQL': () => {
          var sqlText = (buf.id === this.activeBufferId && this.editor) ? this.editor.getValue() : (buf.sql || '');
          if (navigator && navigator.clipboard) {
            navigator.clipboard.writeText(sqlText);
          }
        },
        'Clear SQL': () => {
          if (buf.id === this.activeBufferId && this.editor) {
            this.editor.setValue('');
          } else {
            buf.sql = '';
            this.persistQueryBuffers();
          }
        }
      };

      if (this.queryBuffers.length > 1) {
        actions['sep1'] = 'separator';
        actions['Close Tab'] = () => {
          this.closeQueryBuffer(buf.id);
        };
        actions['Close Other Tabs'] = () => {
          this.closeOtherQueryBuffers(buf.id);
        };
      }

      if (typeof ($u as any).contextMenu === 'function') {
        ($u as any).contextMenu(bubble, actions);
      }

      container.append(bubble);
    });

    var addBtn = $u('<a class="query-bubble query-bubble-add" href="javascript:void(0)" title="New Query Buffer">+</a>');
    addBtn.on('click', (e) => {
      e.preventDefault();
      this.addNewQueryBuffer();
    });
    if (typeof ($u as any).contextMenu === 'function') {
      ($u as any).contextMenu(addBtn, {
        'New Tab': () => {
          this.addNewQueryBuffer();
        }
      });
    }
    container.append(addBtn);
  }

  switchQueryBuffer (id: string) {
    if (id === this.activeBufferId) return;

    var current = this.queryBuffers.find(b => b.id === this.activeBufferId);
    if (current) {
      current.sql = this.editor.getValue();
      current.statusText = this.statusLine ? this.statusLine.text() : '';
      current.lastResult = this.lastResult;
      var currentResNode = this.content.find('.result .rescol-wrapper')[0];
      if (currentResNode && typeof currentResNode.cloneNode === 'function') {
        current.resultNode = currentResNode.cloneNode(true) as HTMLElement;
      }
    }

    var next = this.queryBuffers.find(b => b.id === id);
    if (!next) return;

    this.activeBufferId = id;
    window.localStorage.setItem('postbird_active_buffer_id', id);

    this.editor.setValue(next.sql || '');
    if (next.id === this.queryBuffers[0].id) {
      Model.LastQuery.save(next.sql || '');
    }

    if (next.resultNode && typeof next.resultNode.cloneNode === 'function') {
      this.content.find('.result .rescol-wrapper').replaceWith(next.resultNode.cloneNode(true) as HTMLElement);
      this.lastResult = next.lastResult || null;
      if (this.statusLine) {
        this.statusLine.text(next.statusText || '');
      }
    } else {
      this.cleanResult();
    }

    this.toggleCleanButton();
    this.toggleSaveButton();
    this.renderQueryBubbles();
    this.editor.focus();
  }

  addNewQueryBuffer () {
    var current = this.queryBuffers.find(b => b.id === this.activeBufferId);
    if (current) {
      current.sql = this.editor.getValue();
    }

    var newId = String(Date.now());
    this.queryBuffers.push({ id: newId, sql: '' });
    this.persistQueryBuffers();
    this.switchQueryBuffer(newId);
  }

  duplicateQueryBuffer (id: string) {
    var target = this.queryBuffers.find(b => b.id === id);
    var sqlToCopy = (target && target.id === this.activeBufferId && this.editor) ? this.editor.getValue() : (target ? target.sql : '');
    var newId = String(Date.now());
    this.queryBuffers.push({ id: newId, sql: sqlToCopy || '' });
    this.persistQueryBuffers();
    this.switchQueryBuffer(newId);
  }

  closeOtherQueryBuffers (keepId: string) {
    var toKeep = this.queryBuffers.find(b => b.id === keepId);
    if (!toKeep) return;
    this.queryBuffers = [toKeep];
    this.persistQueryBuffers();
    this.switchQueryBuffer(keepId);
  }

  closeQueryBuffer (id: string) {
    if (this.queryBuffers.length <= 1) return;

    var idx = this.queryBuffers.findIndex(b => b.id === id);
    if (idx === -1) return;

    this.queryBuffers.splice(idx, 1);
    this.persistQueryBuffers();

    if (this.activeBufferId === id) {
      var nextIdx = Math.max(0, idx - 1);
      this.switchQueryBuffer(this.queryBuffers[nextIdx].id);
    } else {
      this.renderQueryBubbles();
    }
  }

  persistQueryBuffers () {
    try {
      window.localStorage.setItem('postbird_query_buffers', JSON.stringify(
        this.queryBuffers.map(b => ({ id: b.id, sql: b.sql }))
      ));
    } catch (e) {
      console.warn('Could not persist query buffers to localStorage', e);
    }
  }

  setLayout (mode: 'split' | 'editor' | 'results') {
    this.currentLayout = mode;
    var mainPanel = this.content.find('.query-main-panel');
    mainPanel.removeClass('layout-editor').removeClass('layout-results');
    this.content.find('.layout-switcher .layout-btn').removeClass('active');

    if (mode === 'editor') {
      mainPanel.addClass('layout-editor');
      this.content.find('.layout-switcher .layout-editor').addClass('active');
    } else if (mode === 'results') {
      mainPanel.addClass('layout-results');
      this.content.find('.layout-switcher .layout-results').addClass('active');
    } else {
      this.content.find('.layout-switcher .layout-split').addClass('active');
    }

    if (this.editor) {
      this.editor.refresh();
    }
  }

  initAiPanelResize () {
    var aiPanel = this.content.find('.query-ai-panel');
    var handle = this.content.find('.ai-panel-resizer');
    if (!aiPanel.length || !handle.length) return;

    var applyPanelWidth = (w: number) => {
      this.aiPanelWidth = w;
      if (aiPanel[0]) {
        if (!aiPanel[0].style) (aiPanel[0] as any).style = {};
        aiPanel[0].style.width = `${w}px`;
        aiPanel[0].style.flexBasis = `${w}px`;
      }
    };

    var savedWidth = parseInt(window.localStorage.getItem('postbird_ai_panel_width') || '', 10);
    if (!isNaN(savedWidth) && savedWidth >= 240 && savedWidth <= 1200) {
      applyPanelWidth(savedWidth);
    }

    var isResizing = false;
    var currentWidth = !isNaN(savedWidth) ? savedWidth : 320;
    var doc = (this.content[0] && this.content[0].ownerDocument) || document;

    var onMouseMove = (ev: MouseEvent) => {
      if (!isResizing) return;
      var workspace = this.content.find('.query-workspace')[0];
      var rect = workspace && workspace.getBoundingClientRect ? workspace.getBoundingClientRect() : null;
      var rightEdge = rect ? rect.right : window.innerWidth;
      var maxWidth = rect ? Math.max(320, Math.floor(rect.width * 0.75)) : 900;
      var newWidth = Math.max(240, Math.min(maxWidth, rightEdge - ev.clientX));

      currentWidth = newWidth;
      applyPanelWidth(newWidth);
      if (this.editor) {
        this.editor.refresh();
      }
    };

    var onMouseUp = () => {
      if (!isResizing) return;
      isResizing = false;
      handle.removeClass('resizing');
      $u(doc.body).removeClass('sidebar-resizing');
      if (currentWidth >= 240) {
        try {
          window.localStorage.setItem('postbird_ai_panel_width', String(currentWidth));
        } catch (e) {}
      }
    };

    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('mousemove', onMouseMove);
      doc.addEventListener('mouseup', onMouseUp);
    }

    handle.on('mousedown', (e: any) => {
      e.preventDefault();
      isResizing = true;
      handle.addClass('resizing');
      $u(doc.body).addClass('sidebar-resizing');
    });
  }

  loadAiChatHistory () {
    var raw = window.localStorage.getItem('postbird_ai_chat_history');
    if (!raw) return;

    var list: any[] = [];
    try {
      list = JSON.parse(raw);
    } catch (e) {
      list = [];
    }

    if (!Array.isArray(list) || list.length === 0) return;

    this.aiChatHistory = list.slice(-30);

    var body = this.content.find('.ai-panel-body');
    if (!body || !body.length) return;

    var emptyState = body.find('.ai-empty-state');
    if (typeof emptyState.remove === 'function') {
      emptyState.remove();
    } else if (emptyState[0] && typeof emptyState[0].remove === 'function') {
      emptyState[0].remove();
    }

    this.aiChatHistory.forEach(msg => {
      const msgTitle = msg.title || this.formatMessageTitle({
        timestamp: msg.timestamp || Date.now(),
        provider: msg.provider,
        tokens: msg.tokens || Math.max(1, Math.round((msg.content || '').length / 4)),
        durationMs: msg.durationMs,
        isUser: msg.role === 'user'
      });

      if (msg.role === 'user') {
        var userNode = $u('<div class="ai-msg user"></div>');
        userNode.attr('title', msgTitle);
        var bubble = $u('<div class="msg-bubble"></div>').text(msg.content);
        bubble.attr('title', msgTitle);
        userNode.append(bubble);
        body.append(userNode);
      } else if (msg.role === 'assistant') {
        if (msg.stepsHtml) {
          var stepContainer = $u('<div class="ai-saved-steps"></div>');
          stepContainer.attr('title', msgTitle);
          stepContainer.html(msg.stepsHtml);
          stepContainer.find('.stage-in-editor-btn').on('click', (e: any) => {
            var sql = $u(e.target).closest('.ai-stage-box').find('pre code').text();
            this.addBufferWithSql(sql, 'Remediation Fix');
          });
          stepContainer.find('.view-left-btn').on('click', (e: any) => {
            var sql = $u(e.target).closest('.step-query-box').find('pre code').text();
            this.loadQueryIntoLeft(sql, false);
          });
          body.append(stepContainer);
        } else {
          var assistantNode = $u('<div class="ai-msg assistant"></div>');
          assistantNode.attr('title', msgTitle);
          var bubble = $u('<div class="msg-bubble"></div>');
          bubble.attr('title', msgTitle);
          this.renderAiMessageContent(bubble, msg.content, msg.mode || 'sql');
          assistantNode.append(bubble);
          body.append(assistantNode);
        }
      }
    });

    this.scrollAiPanelToBottom();
  }

  formatMessageTitle (options: {
    timestamp?: number;
    provider?: string;
    tokens?: number;
    durationMs?: number;
    isUser?: boolean;
  }): string {
    const date = new Date(options.timestamp || Date.now());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = date.getDate();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const timeStr = `${hours}:${minutes} ${day} ${month} ${year}`;

    if (options.isUser) {
      if (options.tokens !== undefined) {
        return `${timeStr} - ${options.tokens.toLocaleString()} tok`;
      }
      return timeStr;
    }

    const provider = options.provider || 'ai';
    if (options.tokens !== undefined) {
      let detail = `${provider} ${options.tokens.toLocaleString()} tok`;
      if (options.durationMs !== undefined) {
        const sec = options.durationMs / 1000;
        const secStr = sec >= 10 ? `${Math.round(sec)}s` : `${sec.toFixed(1).replace(/\.0$/, '')}s`;
        detail += `, processed in ${secStr}`;
      }
      return `${timeStr} - ${detail}`;
    } else if (options.provider) {
      let detail = provider;
      if (options.durationMs !== undefined) {
        const sec = options.durationMs / 1000;
        const secStr = sec >= 10 ? `${Math.round(sec)}s` : `${sec.toFixed(1).replace(/\.0$/, '')}s`;
        detail += `, processed in ${secStr}`;
      }
      return `${timeStr} - ${detail}`;
    }

    return timeStr;
  }

  saveAiChatMessage (msg: {
    role: 'user' | 'assistant';
    content: string;
    mode?: 'sql' | 'agent';
    stepsHtml?: string;
    timestamp?: number;
    title?: string;
    provider?: string;
    tokens?: number;
    durationMs?: number;
  }) {
    if (!msg.timestamp) msg.timestamp = Date.now();
    this.aiChatHistory.push(msg);
    if (this.aiChatHistory.length > 30) {
      this.aiChatHistory = this.aiChatHistory.slice(-30);
    }
    try {
      window.localStorage.setItem('postbird_ai_chat_history', JSON.stringify(this.aiChatHistory));
    } catch (e) {
      console.warn('Could not persist postbird_ai_chat_history', e);
    }
  }

  clearAiChatHistory () {
    this.aiChatHistory = [];
    try {
      window.localStorage.removeItem('postbird_ai_chat_history');
    } catch (e) {}

    var body = this.content.find('.ai-panel-body');
    body.empty().append(`
      <div class="ai-empty-state">
        <p class="ai-hint">Ask AI to write, optimize, or explain PostgreSQL queries, or run multi-step schema and data analysis.</p>
      </div>
    `);
  }

  toggleAiPanel () {
    var rawCfg = window.localStorage.getItem('postbird_ai_config');
    var isConfirmed = false;
    if (rawCfg) {
      try {
        var parsed = JSON.parse(rawCfg);
        isConfirmed = !!(parsed && parsed.confirmed);
      } catch (e) {
        isConfirmed = false;
      }
    }

    if (!isConfirmed && !this.aiPanelOpen) {
      if ((global as any).Dialog && (global as any).Dialog.AiSettings) {
        new (global as any).Dialog.AiSettings(this.handler, {
          onConfirmed: () => {
            this.openAiPanelInternal();
          }
        });
        return;
      }
    }

    if (this.aiPanelOpen) {
      this.closeAiPanelInternal();
    } else {
      this.openAiPanelInternal();
    }
  }

  openAiPanelInternal () {
    this.aiPanelOpen = true;
    var aiPanel = this.content.find('.query-ai-panel');
    var aiBtn = this.content.find('.ai-toggle-btn');
    aiPanel.removeClass('is-hidden');
    aiBtn.addClass('active');

    var rawCfg = window.localStorage.getItem('postbird_ai_config');
    if (rawCfg) {
      try {
        var parsed = JSON.parse(rawCfg);
        if (parsed.providerId) {
          this.content.find('.ai-provider-name').text(parsed.providerId.split('-')[0]);
        }
      } catch (e) {}
    }

    if (this.editor) {
      this.editor.refresh();
    }
  }

  closeAiPanelInternal () {
    this.aiPanelOpen = false;
    var aiPanel = this.content.find('.query-ai-panel');
    var aiBtn = this.content.find('.ai-toggle-btn');
    aiPanel.addClass('is-hidden');
    aiBtn.removeClass('active');

    if (this.editor) {
      this.editor.refresh();
    }
  }

  setAiMode (mode: 'sql' | 'agent') {
    this.aiMode = mode;
    this.content.find('.ai-mode-btn').removeClass('active');
    this.content.find(`.ai-mode-btn[exec*="'${mode}'"]`).addClass('active');
  }

  openAiSettings () {
    if ((global as any).Dialog && (global as any).Dialog.AiSettings) {
      new (global as any).Dialog.AiSettings(this.handler, {
        onConfirmed: (cfg: any) => {
          if (cfg && cfg.providerId) {
            this.content.find('.ai-provider-name').text(cfg.providerId.split('-')[0]);
          }
        }
      });
    } else if (window.alertify) {
      window.alertify.alert('AI Settings dialog loading...');
    }
  }

  escapeHtml (str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatMarkdownText (text: string): string {
    if (!text) return '';
    try {
      if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
        return marked.parse(text, { async: false, breaks: true, gfm: true }) as string;
      }
    } catch (e) {
      console.warn('Failed to parse markdown with marked', e);
    }
    var escaped = this.escapeHtml(text);
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    escaped = escaped.replace(/^###\s+(.*$)/gim, '<h4 style="margin: 6px 0 3px 0; font-size: 12px; font-weight: 600;">$1</h4>');
    escaped = escaped.replace(/^##\s+(.*$)/gim, '<h3 style="margin: 8px 0 4px 0; font-size: 13px; font-weight: 600;">$1</h3>');
    escaped = escaped.replace(/\n\n/g, '<div style="margin: 6px 0;"></div>');
    escaped = escaped.replace(/\n/g, '<br/>');
    return escaped;
  }

  insertTextAtCursor (text: string) {
    if (!this.editor) return;
    var doc = (this.editor as any).getDoc ? (this.editor as any).getDoc() : this.editor;
    if (doc.replaceSelection) {
      doc.replaceSelection(text);
    } else if (doc.replaceRange && doc.getCursor) {
      doc.replaceRange(text, doc.getCursor());
    } else {
      this.appendText("\n" + text, 1);
    }
    this.editor.focus();
  }

  replaceEditorWith (text: string) {
    if (!this.editor) return;
    this.editor.setValue(text);
    this.editor.focus();
  }

  runSpecificSql (text: string) {
    if (this.currentLayout === 'results') {
      this.setLayout('split');
    }
    this.replaceEditorWith(text);
    this.runQuery();
  }

  loadQueryIntoLeft (sql: string, autoRun: boolean = false) {
    if (this.currentLayout === 'results') {
      this.setLayout('split');
    }
    this.replaceEditorWith(sql);
    if (autoRun) {
      this.runQuery();
    }
  }

  addBufferWithSql (sql: string, title?: string) {
    this.addNewQueryBuffer();
    this.replaceEditorWith(sql);
    if (this.currentLayout === 'results') {
      this.setLayout('split');
    }
  }

  scrollAiPanelToBottom () {
    var panelBody = this.content.find('.ai-panel-body');
    if (panelBody && panelBody[0]) {
      panelBody[0].scrollTop = panelBody[0].scrollHeight;
    }
  }

  getAiConnector () {
    var rawCfg = window.localStorage.getItem('postbird_ai_config');
    var cfg: any = {};
    if (rawCfg) {
      try {
        cfg = JSON.parse(rawCfg);
      } catch (e) {}
    }

    var isCliProvider = ['claude', 'agy', 'fm', 'cursor-agent', 'gemini', 'codex'].includes(cfg.providerId);
    if (isCliProvider && (cfg.baseUrl || cfg.apiKey)) {
      delete cfg.baseUrl;
      delete cfg.apiKey;
      try {
        window.localStorage.setItem('postbird_ai_config', JSON.stringify(cfg));
      } catch (e) {}
    }

    var connectorConfig: any = {
      preferredProvider: cfg.providerId || 'auto',
      preferredModel: cfg.model,
    };

    if (cfg.baseUrl && !isCliProvider) {
      connectorConfig.customEndpoint = {
        id: cfg.providerId || 'custom-endpoint',
        name: cfg.providerName || 'Custom Endpoint',
        baseUrl: cfg.baseUrl,
        apiKey: cfg.apiKey,
        model: cfg.model
      };
    }

    return localAIConnector.createAIConnector(connectorConfig);
  }

  async getDatabaseContext (): Promise<string> {
    var parts: string[] = [];
    var dbName = (this.handler && this.handler.database) || (this.handler && this.handler.connection && this.handler.connection.options && this.handler.connection.options.database) || 'current';
    var schemaName = (this.handler && this.handler.currentSchema) || 'public';
    parts.push(`Database: "${dbName}"`);
    parts.push(`Schema: "${schemaName}"`);

    var hasConnection = !!(this.handler && this.handler.connection && this.handler.connection.connection);

    // 1. Include lightweight list of table names in current schema (names only, no full column dump)
    if (hasConnection) {
      try {
        var safeSchema = schemaName.replace(/'/g, "''");
        var tablesQuery = `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = '${safeSchema}'
          ORDER BY table_name
          LIMIT 250;
        `;
        var tablesRes = await this.handler.connection.query(tablesQuery);
        if (tablesRes && tablesRes.rows && tablesRes.rows.length) {
          var tableNames = tablesRes.rows.map((r: any) => r.table_name).filter(Boolean);
          parts.push(`Available Tables in "${schemaName}" (${tableNames.length}): ${tableNames.join(', ')}`);
        }
      } catch (e) {}
    }

    // 2. Include currently selected table and its full column structure (user often refers to the selected table)
    if (this.handler && this.handler.currentTable) {
      parts.push(`Currently Selected Table: "${this.handler.currentTable}"`);
      if (hasConnection) {
        try {
          var selectedStructure = await this.fetchTablesStructure([this.handler.currentTable]);
          if (selectedStructure) {
            parts.push(selectedStructure);
          }
        } catch (e) {}
      }
    }

    return parts.join('\n');
  }

  async fetchTablesStructure (tableNames: string[]): Promise<string> {
    if (!this.handler || !this.handler.connection || !this.handler.connection.connection) {
      return 'Not connected to database.';
    }

    var schemaName = (this.handler && this.handler.currentSchema) || 'public';
    var safeSchema = schemaName.replace(/'/g, "''");
    var cleaned = tableNames
      .map(t => t.trim().replace(/^["'`]+|["'`]+$/g, '').split('.').pop() || '')
      .map(t => t.replace(/[^a-zA-Z0-9_$]/g, ''))
      .filter(Boolean);

    if (cleaned.length === 0) {
      return 'No valid table names specified.';
    }

    var quotedList = cleaned.map(t => `'${t.replace(/'/g, "''")}'`).join(', ');
    var colQuery = `
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = '${safeSchema}' AND table_name IN (${quotedList})
      ORDER BY table_name, ordinal_position;
    `;

    var fkMap: Record<string, string> = {};
    try {
      var fkQuery = `
        SELECT
          kcu.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = '${safeSchema}'
          AND kcu.table_name IN (${quotedList});
      `;
      var fkRes = await this.handler.connection.query(fkQuery);
      if (fkRes && fkRes.rows) {
        for (var fk of fkRes.rows) {
          fkMap[`${fk.table_name}.${fk.column_name}`] = `${fk.foreign_table_name}.${fk.foreign_column_name}`;
        }
      }
    } catch (e) {}

    var res = await this.handler.connection.query(colQuery);
    if (!res || !res.rows || res.rows.length === 0) {
      return `No columns found for table(s): ${cleaned.join(', ')} in schema "${schemaName}".`;
    }

    var byTable: Record<string, string[]> = {};
    for (var row of res.rows) {
      if (!byTable[row.table_name]) byTable[row.table_name] = [];
      var fkRef = fkMap[`${row.table_name}.${row.column_name}`];
      var colDesc = `${row.column_name} (${row.data_type}${row.is_nullable === 'NO' ? ', NOT NULL' : ''}${fkRef ? ` -> ${fkRef}` : ''})`;
      byTable[row.table_name].push(colDesc);
    }

    return Object.keys(byTable)
      .map(tbl => `Columns of "${tbl}": ${byTable[tbl].join(', ')}`)
      .join('\n');
  }

  renderAiMessageContent (container: any, markdown: string, mode: string = 'sql') {
    container.empty();

    const codeBlockRegex = /```(?:sql(?::([a-zA-Z0-9_-]+))?|pgsql)?\s*\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const textBefore = markdown.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        container.append($u('<div class="ai-text-chunk"></div>').html(this.formatMarkdownText(textBefore)));
      }

      const blockType = (match[1] || '').toLowerCase();
      const code = (match[2] || '').trim();

      if (blockType === 'inspect_schema') {
        const inspectBadge = $u(`
          <div class="step-result-badge ai-schema-inspect-badge">
            🔍 Inspecting table structure: <code>${this.escapeHtml(code.replace(/\s+/g, ' '))}</code>
          </div>
        `);
        container.append(inspectBadge);
      } else if (blockType === 'stage') {
        const stageBox = $u(`
          <div class="ai-stage-box">
            <div class="stage-header">
              <span class="stage-badge">⚠️ Staged Remediation Query</span>
              <button class="stage-in-editor-btn">Stage in SQL Editor</button>
            </div>
            <pre><code>${this.escapeHtml(code)}</code></pre>
          </div>
        `);
        stageBox.find('.stage-in-editor-btn').on('click', () => {
          this.addBufferWithSql(code, 'Remediation Fix');
        });
        container.append(stageBox);
      } else {
        const codeBlock = $u(`
          <div class="ai-code-block">
            <div class="code-block-header">
              <span>SQL</span>
              <div class="code-actions">
                <button class="code-act-insert" title="Insert at cursor">Insert</button>
                <button class="code-act-replace" title="Replace editor text">Replace</button>
                <button class="code-act-run" title="Run query now">Run</button>
                <button class="code-act-copy" title="Copy to clipboard">Copy</button>
              </div>
            </div>
            <pre><code>${this.escapeHtml(code)}</code></pre>
          </div>
        `);

        codeBlock.find('.code-act-insert').on('click', () => {
          this.insertTextAtCursor(code);
        });
        codeBlock.find('.code-act-replace').on('click', () => {
          this.replaceEditorWith(code);
        });
        codeBlock.find('.code-act-run').on('click', () => {
          this.runSpecificSql(code);
        });
        codeBlock.find('.code-act-copy').on('click', (e: any) => {
          if (navigator && navigator.clipboard) {
            navigator.clipboard.writeText(code);
            $u(e.target).text('Copied!');
            setTimeout(() => { $u(e.target).text('Copy'); }, 1500);
          }
        });
        container.append(codeBlock);
      }

      lastIndex = codeBlockRegex.lastIndex;
    }

    const remaining = markdown.substring(lastIndex);
    if (remaining.trim()) {
      container.append($u('<div class="ai-text-chunk"></div>').html(this.formatMarkdownText(remaining)));
    }
  }

  sendAiPrompt () {
    var rawCfg = window.localStorage.getItem('postbird_ai_config');
    var isConfirmed = false;
    if (rawCfg) {
      try {
        var parsed = JSON.parse(rawCfg);
        isConfirmed = !!(parsed && parsed.confirmed);
      } catch (e) {
        isConfirmed = false;
      }
    }

    if (!isConfirmed) {
      this.openAiSettings();
      return;
    }

    var input = this.content.find('.ai-prompt-input');
    var prompt = (input.val() || '').toString().trim();
    if (!prompt) return;

    input.val('');

    // Remove empty state placeholder if present
    var emptyPlaceholder = this.content.find('.ai-panel-body .ai-empty-state');
    if (typeof emptyPlaceholder.remove === 'function') {
      emptyPlaceholder.remove();
    } else if (emptyPlaceholder[0] && typeof emptyPlaceholder[0].remove === 'function') {
      emptyPlaceholder[0].remove();
    }

    var body = this.content.find('.ai-panel-body');
    var userTokens = Math.max(1, Math.round(prompt.length / 4));
    var userTitle = this.formatMessageTitle({
      timestamp: Date.now(),
      tokens: userTokens,
      isUser: true
    });
    var userEntry = $u('<div class="ai-msg user"></div>');
    userEntry.attr('title', userTitle);
    var userBubble = $u('<div class="msg-bubble"></div>').text(prompt);
    userBubble.attr('title', userTitle);
    userEntry.append(userBubble);
    body.append(userEntry);
    this.scrollAiPanelToBottom();

    this.saveAiChatMessage({
      role: 'user',
      content: prompt,
      mode: this.aiMode,
      title: userTitle,
      tokens: userTokens,
      timestamp: Date.now()
    });

    if (this.aiMode === 'agent') {
      this.executeAnalystMode(prompt, body);
    } else {
      this.executeSqlMode(prompt, body);
    }
  }

  async executeSqlMode (prompt: string, body: any) {
    var dbContext = await this.getDatabaseContext();
    var currentSql = this.editor ? (this.editor.getValue() || '').trim() : '';
    var selectedSql = this.editor ? (this.editor.getSelection() || '').trim() : '';

    var contextPrompt = `PostgreSQL Database Context:\n${dbContext}\n`;
    if (selectedSql) {
      contextPrompt += `\nSelected SQL:\n\`\`\`sql\n${selectedSql}\n\`\`\`\n`;
    } else if (currentSql) {
      contextPrompt += `\nCurrent Editor SQL:\n\`\`\`sql\n${currentSql}\n\`\`\`\n`;
    }

    var systemInstructions = [
      'You are an expert PostgreSQL assistant embedded in the Postbird database manager.',
      'Help write, explain, optimize, or fix PostgreSQL queries.',
      'You receive the list of table names in the current schema and the columns of the currently selected table (if any).',
      'If you need the column structure of other tables from the table list to write an accurate query, output ONLY an inspection block:',
      '```sql:inspect_schema',
      'table_name_1, table_name_2',
      '```',
      'Postbird will immediately fetch their exact columns and foreign keys and provide them to you in the next turn.',
      'When outputting final SQL code, always enclose it in ```sql ... ``` code blocks with valid PostgreSQL syntax.'
    ].join('\n');

    var messages: any[] = [
      {
        role: 'system',
        content: systemInstructions
      },
      {
        role: 'user',
        content: `${contextPrompt}\nUser request: ${prompt}`
      }
    ];

    var connector = this.getAiConnector();
    var rawCfg = window.localStorage.getItem('postbird_ai_config');
    var cfg = rawCfg ? JSON.parse(rawCfg) : {};

    var maxTurns = 3;
    var turn = 0;
    var startTime = Date.now();

    while (turn < maxTurns) {
      turn++;
      var assistantMsgNode = $u('<div class="ai-msg assistant"><div class="msg-bubble streaming"><span class="ai-loading-dots">Thinking...</span></div></div>');
      body.append(assistantMsgNode);
      this.scrollAiPanelToBottom();

      var accumulated = '';
      try {
        await connector.chatStream(
          messages,
          {
            provider: cfg.providerId,
            model: cfg.model
          },
          (chunk: string) => {
            accumulated += chunk;
            var bubble = assistantMsgNode.find('.msg-bubble');
            bubble.removeClass('streaming');
            this.renderAiMessageContent(bubble, accumulated, 'sql');
            this.scrollAiPanelToBottom();
          }
        );

        if (!accumulated.trim()) {
          assistantMsgNode.find('.msg-bubble').removeClass('streaming').text('No response received from AI provider.');
          break;
        }

        // Check if the AI requested on-demand table schema inspection
        var inspectMatch = accumulated.match(/```sql:inspect_schema\s*([\s\S]*?)```/i);
        if (inspectMatch && turn < maxTurns) {
          var rawTables = inspectMatch[1].trim();
          var requestedTables = rawTables.split(/[,\n]+/).map(t => t.trim()).filter(Boolean);
          if (requestedTables.length > 0) {
            var schemaInfo = await this.fetchTablesStructure(requestedTables);
            assistantMsgNode.find('.msg-bubble').append(`
              <div class="step-result-badge">
                ✓ Loaded structure for: ${this.escapeHtml(requestedTables.join(', '))}
              </div>
            `);
            this.scrollAiPanelToBottom();

            messages.push({ role: 'assistant', content: accumulated });
            messages.push({
              role: 'user',
              content: `Requested Table Structure:\n${schemaInfo}\n\nNow write the PostgreSQL query for the user's request.`
            });
            continue;
          }
        }

        if (accumulated.trim()) {
          var durationMs = Date.now() - startTime;
          var promptTokens = Math.max(1, Math.round(prompt.length / 4));
          var respTokens = Math.max(1, Math.round(accumulated.length / 4));
          var totalTokens = promptTokens + respTokens;
          var providerName = (cfg.providerId || cfg.model || 'claude').replace(/^openai-compatible-?/i, '');

          var title = this.formatMessageTitle({
            timestamp: Date.now(),
            provider: providerName,
            tokens: totalTokens,
            durationMs: durationMs
          });

          assistantMsgNode.attr('title', title);
          assistantMsgNode.find('.msg-bubble').attr('title', title);

          this.saveAiChatMessage({
            role: 'assistant',
            content: accumulated,
            mode: 'sql',
            title: title,
            provider: providerName,
            tokens: totalTokens,
            durationMs: durationMs,
            timestamp: Date.now()
          });

          // If the assistant message is taller than the visible viewport, scroll to its top
          // so the user sees the start of the query rather than only the tail end
          const bodyEl = this.content.find('.ai-panel-body')[0];
          const msgEl = assistantMsgNode[0];
          if (bodyEl && msgEl && msgEl.offsetHeight > bodyEl.clientHeight * 0.7) {
            msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        break;
      } catch (err: any) {
        assistantMsgNode.find('.msg-bubble').removeClass('streaming').html(`<div class="ai-error-notice">⚠️ ${this.escapeHtml(err.message || String(err))}</div>`);
        break;
      }
    }
  }

  async executeAnalystMode (initialPrompt: string, body: any) {
    var analystStartTime = Date.now();
    var dbContext = await this.getDatabaseContext();

    var systemPrompt = `You are an expert PostgreSQL Database Analyst inside Postbird.
You analyze database schema integrity, foreign keys, orphan records, deduplication, and consistency.
You have read-only inspection access to the live PostgreSQL database.
Workflow:
1. You are given the list of table names in the current schema and the columns of the currently selected table.
   - To fetch column structures and foreign keys of other tables on demand, output:
\`\`\`sql:inspect_schema
table_name_1, table_name_2
\`\`\`
   - Or to run a read-only PostgreSQL query to inspect data or catalog metadata, output EXACTLY ONE query enclosed in:
\`\`\`sql:execute
SELECT ...
\`\`\`
The application will execute the inspection and return the result to you.
2. Based on results, determine the next step or conclude.
3. If you find issues and recommend fixes (such as DELETE orphan rows, UPDATE data, or ALTER TABLE / ADD CONSTRAINT / CREATE INDEX), DO NOT execute them. Instead, stage them enclosed in:
\`\`\`sql:stage
-- Staged Remediation Query
DELETE FROM ...;
\`\`\`
4. Conclude with a clear, concise findings summary explaining what was checked and what was found.`;

    var messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Database Context:\n${dbContext}\n\nTask:\n${initialPrompt}` }
    ];

    var connector = this.getAiConnector();
    var rawCfg = window.localStorage.getItem('postbird_ai_config');
    var cfg = rawCfg ? JSON.parse(rawCfg) : {};

    var stepCount = 0;
    var maxSteps = 5;

    while (stepCount < maxSteps) {
      stepCount++;

      var stepCard = $u(`
        <div class="ai-step-card step-${stepCount}">
          <div class="step-header">
            <span class="step-badge">Step ${stepCount}</span>
            <span class="step-status">Thinking...</span>
          </div>
          <div class="step-body"></div>
        </div>
      `);
      body.append(stepCard);
      this.scrollAiPanelToBottom();

      var assistantText = '';
      try {
        var resp = await connector.chat(messages, {
          provider: cfg.providerId,
          model: cfg.model
        });
        assistantText = resp.content || '';
      } catch (err: any) {
        stepCard.find('.step-status').text('Error').addClass('error');
        stepCard.find('.step-body').html(`<div class="ai-error-notice">⚠️ ${this.escapeHtml(err.message || String(err))}</div>`);
        break;
      }

      messages.push({ role: 'assistant', content: assistantText });

      var inspectMatch = assistantText.match(/```sql:inspect_schema\s*([\s\S]*?)```/i);
      var executeMatch = assistantText.match(/```sql:execute\s*([\s\S]*?)```/i);
      var stageMatch = assistantText.match(/```sql:stage\s*([\s\S]*?)```/i);

      var displayText = assistantText
        .replace(/```sql:inspect_schema[\s\S]*?```/gi, '')
        .replace(/```sql:execute[\s\S]*?```/gi, '')
        .replace(/```sql:stage[\s\S]*?```/gi, '')
        .trim();

      if (displayText) {
        stepCard.find('.step-body').append(`<div class="step-text">${this.formatMarkdownText(displayText)}</div>`);
      }

      if (inspectMatch) {
        var rawTables = inspectMatch[1].trim();
        var requestedTables = rawTables.split(/[,\n]+/).map(t => t.trim()).filter(Boolean);
        stepCard.find('.step-status').text('Inspecting schema');
        var schemaInfo = await this.fetchTablesStructure(requestedTables);
        stepCard.find('.step-status').text('Schema loaded').addClass('success');
        stepCard.find('.step-body').append(`
          <div class="step-result-badge">
            🔍 Inspected structure of: ${this.escapeHtml(requestedTables.join(', '))}
          </div>
        `);
        messages.push({
          role: 'user',
          content: `Table Structure Inspection Result:\n${schemaInfo}\n\nProceed to the next step or conclude your analysis.`
        });
        this.scrollAiPanelToBottom();
        continue;
      }

      if (executeMatch) {
        var queryToRun = executeMatch[1].trim();
        stepCard.find('.step-status').text('Inspecting database');

        var queryPreview = $u(`
          <div class="step-query-box">
            <div class="query-box-bar">
              <span class="query-label">Inspection Query</span>
              <button class="view-left-btn" title="Open query in editor and view on left table">← View on Left</button>
            </div>
            <pre><code>${this.escapeHtml(queryToRun)}</code></pre>
          </div>
        `);

        queryPreview.find('.view-left-btn').on('click', () => {
          this.loadQueryIntoLeft(queryToRun, true);
        });
        stepCard.find('.step-body').append(queryPreview);

        // Verify read-only query
        var isReadOnly = /^\s*(SELECT|EXPLAIN|SHOW|WITH)\b/i.test(queryToRun) &&
          !/\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE)\b/i.test(queryToRun);

        if (!isReadOnly) {
          stepCard.find('.step-status').text('Security Blocked').addClass('error');
          stepCard.find('.step-body').append(`<div class="ai-error-notice">⚠️ Automatic execution blocked: query contains modifying statements. Only read-only SELECT queries can be auto-executed in Analyst mode.</div>`);
          break;
        }

        var autoRunElem = this.content.find('.ai-auto-run-selects');
        var autoRunChecked = typeof autoRunElem.prop === 'function' ? autoRunElem.prop('checked') : (autoRunElem[0] ? (autoRunElem[0] as any).checked : true);
        if (!autoRunChecked) {
          var runBtn = $u('<button class="native-look step-manual-run-btn">Execute This Step</button>');
          stepCard.find('.step-body').append(runBtn);
          await new Promise((resolve) => {
            runBtn.on('click', () => {
              runBtn.remove();
              resolve(true);
            });
          });
        }

        if (!this.handler.connection || !this.handler.connection.connection) {
          stepCard.find('.step-status').text('Disconnected').addClass('error');
          stepCard.find('.step-body').append('<div class="ai-error-notice">Not connected to database server.</div>');
          break;
        }

        try {
          stepCard.find('.step-status').text('Querying...');
          var startT = Date.now();
          var res = await this.handler.connection.queryWithOptions(queryToRun, { rowMode: 'array' });
          var dur = Date.now() - startT;
          stepCard.find('.step-status').text(`Completed (${dur}ms)`).addClass('success');

          var rowsCount = res.rows ? res.rows.length : (res.rowCount || 0);
          var colNames = (res.fields || []).map((f: any) => f.name);
          var sampleRows = (res.rows || []).slice(0, 30);

          stepCard.find('.step-body').append(`
            <div class="step-result-badge">
              ✓ Returned ${rowsCount} ${rowsCount === 1 ? 'row' : 'rows'} ${rowsCount > 30 ? '(first 30 sent to AI)' : ''}
            </div>
          `);

          var formattedForLlm = `Columns: [${colNames.join(', ')}]\nTotal Rows: ${rowsCount}\n`;
          formattedForLlm += `Data:\n${JSON.stringify(sampleRows)}`;

          messages.push({
            role: 'user',
            content: `Query Result for: ${queryToRun}\n\n${formattedForLlm}\n\nAnalyze this result and determine next step or conclude.`
          });
        } catch (qErr: any) {
          stepCard.find('.step-status').text('Query Failed').addClass('error');
          stepCard.find('.step-body').append(`<div class="ai-error-notice">PostgreSQL Error: ${this.escapeHtml(qErr.message || String(qErr))}</div>`);
          messages.push({
            role: 'user',
            content: `Query failed with error: ${qErr.message}. Adjust query or conclude.`
          });
        }
      }

      if (stageMatch) {
        var stagedSql = stageMatch[1].trim();
        var stageCard = $u(`
          <div class="ai-stage-box">
            <div class="stage-header">
              <span class="stage-badge">⚠️ Recommended Fix / Remediation</span>
              <button class="stage-in-editor-btn">Stage in SQL Editor</button>
            </div>
            <pre><code>${this.escapeHtml(stagedSql)}</code></pre>
          </div>
        `);

        stageCard.find('.stage-in-editor-btn').on('click', () => {
          this.addBufferWithSql(stagedSql, 'Remediation Fix');
        });
        stepCard.find('.step-body').append(stageCard);
      }

      if (!executeMatch) {
        stepCard.find('.step-status').text('Concluded').addClass('done');
        break;
      }
    }

    var sessionHtml = '';
    for (var i = 1; i <= stepCount; i++) {
      var card = body.find(`.step-${i}`);
      if (card.length && card[0]) {
        sessionHtml += (card[0] as any).outerHTML || '';
      }
    }

    var rawCfg = window.localStorage.getItem('postbird_ai_config');
    var cfg = rawCfg ? JSON.parse(rawCfg) : {};
    var analystDurationMs = Date.now() - analystStartTime;
    var analystTokens = Math.max(1, Math.round((initialPrompt.length + sessionHtml.length) / 4));
    var analystProvider = (cfg.providerId || cfg.model || 'claude').replace(/^openai-compatible-?/i, '');
    var analystTitle = this.formatMessageTitle({
      timestamp: Date.now(),
      provider: analystProvider,
      tokens: analystTokens,
      durationMs: analystDurationMs
    });

    this.saveAiChatMessage({
      role: 'assistant',
      content: initialPrompt,
      stepsHtml: sessionHtml,
      mode: 'agent',
      title: analystTitle,
      provider: analystProvider,
      tokens: analystTokens,
      durationMs: analystDurationMs,
      timestamp: Date.now()
    });

    this.scrollAiPanelToBottom();
  }

  saveLastQuery () {
    var value = this.editor.getValue();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      var current = this.queryBuffers.find(b => b.id === this.activeBufferId);
      if (current) {
        current.sql = value;
        this.persistQueryBuffers();
      }
      Model.LastQuery.save(value);
      delete this.saveTimeout;
    }, 700);

  }

  toggleButtonText () {
    var runLabel = "Run Query";
    var selectedLabel = "Run Selection";

    var selectedText = this.editor.getSelection();
    if (selectedText && selectedText != "") {
      this.button.text(selectedLabel);
    } else {
      this.button.text(runLabel);
    }
  }

  toggleCleanButton () {
    if (!this.cleanButton) return;
    if (this.content.find('.result table tr').length) {
      this.cleanButton.show();
    } else {
      this.cleanButton.hide();
    }
  }

  toggleSaveButton () {
    var hasRows = Boolean(this.content.find('.result table tr').length);
    if (this.saveButton) {
      if (hasRows) this.saveButton.show();
      else this.saveButton.hide();
    }
    if (this.copyButton) {
      if (hasRows) this.copyButton.show();
      else this.copyButton.hide();
    }
  }

  saveSnippet () {
    this.editor.save();
    this.statusLine.text('');

    var selectedText = this.editor.getSelection();

    var sql = selectedText || this.textarea.val();

    new Dialog.NewSnippet(sql)
  }

  runQuery () {
    this.editor.save();
    this.statusLine.text('');

    // If currently viewing full editor, restore split view so user sees the results
    if (this.currentLayout === 'editor') {
      this.setLayout('split');
    }

    if (!this.handler.connection.connection) {
      window.alertify.confirm("Not connected to server, reconnect?", (is_yes) => {
        if (is_yes) {
          this.handler.reconnect((success) => {
            if (success) this.runQuery();
          });
        }
      });
      return;
    }

    var selectedText = this.editor.getSelection();

    var sql = selectedText || this.textarea.val().toString();

    if (this.isReadOnly()) {
      var cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      var isMutating = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE)\b/i.test(cleanSql);
      if (isMutating) {
        this.statusLine.text("⚠️ Blocked: Connection is in read-only mode. Modifying statements are not permitted.");
        $u.alertError("Read-Only Mode Active", {
          detail: "This connection is set to read-only mode to protect your database. Modifying statements (INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE) cannot be executed."
        });
        return;
      }
    }

    var tableRegex = /(create|drop)\s+(OR REPLACE\s+)?((GLOBAL|LOCAL|TEMPORARY|TEMP|UNLOGGED|FOREIGN|MATERIALIZED)\s+)*\s*(table|schema|view)/im;
    var needReloadTables = tableRegex.test(sql);

    this.button.text("Running...");

    App.startLoading("Query still running...", 1000, {
      cancel () {
        App.stopRunningQuery();
      }
    });

    this.handler.connection.queryWithOptions(sql, {rowMode: 'array'}, (data, error) => {
      this.toggleButtonText();
      App.stopLoading();
      if (error) {
        this.cleanResult();
        var message = error.message;
        if (message == "invalid message format") message += ". It can be if too many records, try add 'limit'";
        this.statusLine.text(message);
      } else {
        this.lastResult = data;
        PgTypeNames.extendFields(data);
        if (data.rows) {
          data.completeRows = data.rows.slice();
          if (data.rows.length > 500) {
            data.rows.length = 500;
          }
        }
        var node = App.renderView('db_rows_table', {data: data})[0];
        $u(node).addClass('command_' + data.command);
        var existingWrapper = this.content.find('.result .rescol-wrapper');
        if (existingWrapper.length) {
          existingWrapper.replaceWith(node);
        } else {
          this.content.find('.result').prepend(node);
        }

        var footerText;
        if ((data.fields && data.fields.length && !isNaN(data.rowCount)) || data.command == "SELECT") {
          footerText = `Found ${data.rowCount} ${data.rowCount > 1 ? 'rows' : 'row'} in ${data.time} ms.`;
          if (data.rowCount > 500) {
            footerText += " Shown first 500 records";
          }
        } else {
          footerText = `Complete, taking ${data.time} ms.`;
          if (data.rowCount) {
            footerText += ` Affected ${data.rowCount} ${data.rowCount > 1 ? 'rows' : 'row'}`;
          }
        }
        this.statusLine.text(footerText);
        this.initTables();
        if (data.command == "EXPLAIN") {
          this.content.find('.result .rescol-wrapper').css('width', '');
        }
      }
      this.toggleCleanButton();
      this.toggleSaveButton();
      if (needReloadTables) {
        this.reloadTables();
      }
      this.editor.focus();
    });
  }

  cleanResult () {
    this.content.find('.result .rescol-wrapper').html("").hide();
    this.statusLine.text("");
    this.lastResult = null;
  }

  cleanButtonClick () {
    this.cleanResult();
    this.toggleCleanButton();
    this.toggleSaveButton();
  }

  reloadTables () {
    this.handler.fetchTablesAndSchemas();
  }

  appendText (sql, lineOffset) {
    if (lineOffset == undefined) lineOffset = 1;

    var lineNo = this.editor.lineCount();
    this.editor.setValue(this.editor.getValue() + sql);
    this.editor.setCursor(lineNo + lineOffset, 0);
    this.editor.focus();
  }

  openSnippets () {
    new SnippetsWindow();
  }

  showHistory () {
    new HistoryWindow();
  }

  async saveQueryResult () {
    var dialog = electronRemote.dialog;
    var mainWindow = electronRemote.app.mainWindow;
    var res = await dialog.showSaveDialog(mainWindow, {
      title: "Save result as csv file",
      defaultPath: "result.csv",
      //message: "aaaa",
      filters: [
        {name: 'CSV File', extensions: ['csv']},
        {name: 'Other', extensions: ['*']}
      ]
    });
    if (res.filePath) {
      this.saveResultTo(res.filePath);
    }
  }

  saveResultTo(filename) {
    App.startLoading("Saving file...", 100);

    var fileWriter = fs.createWriteStream(filename);

    fileWriter.on('finish', () => {
      console.log('file saved');
      App.stopLoading();
    });

    var columns = this.lastResult.fields.map(col => { return col.name });
    fileWriter.write(toCsvRow(columns));

    this.lastResult.completeRows.forEach(row => {
      fileWriter.write(toCsvRow(row));
    });
    fileWriter.end();
  }

  bindResultsContextMenu () {
    var resultContainer = this.content.find('.result');
    if (!resultContainer.length) return;

    var contextMenuActions: Record<string, any> = {
      'Copy'() {
        window.document.execCommand("copy");
      },
      'sep1': 'separator',
      'Copy Row as JSON': (menuItem: any) => {
        var event = (resultContainer[0] as any)?.contextmenu?.clickEvent;
        if (!event) return;
        var el = event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tbody tr')[0];
        this.copyResultRowAsJson(el);
      },
      'Copy Row as Markdown': (menuItem: any) => {
        var event = (resultContainer[0] as any)?.contextmenu?.clickEvent;
        if (!event) return;
        var el = event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tbody tr')[0];
        this.copyResultRowAsMarkdown(el);
      },
      'sep2': 'separator',
      'Copy Column as IN (...)': (menuItem: any) => {
        var event = (resultContainer[0] as any)?.contextmenu?.clickEvent;
        if (!event) return;
        var cell = event.target.tagName == 'TD' || event.target.tagName == 'TH' ? event.target : $u(event.target).closest('td, th')[0];
        this.copyResultColumnAsInClause(cell);
      },
      'sep3': 'separator',
      'Copy All Results as JSON': () => {
        this.copyAllResultsAsJson();
      },
      'Copy All Results as Markdown': () => {
        this.copyAllResultsAsMarkdown();
      },
      'Copy All Results as CSV': () => {
        this.copyAllResultsAsCsv();
      }
    };

    $u.contextMenu(resultContainer, contextMenuActions, {
      onShow: (event: any, contextmenu: any) => {
        var isTextSelected = window.getSelection().toString() != "";
        var target = event.target as HTMLElement;
        var hasResult = Boolean(this.lastResult && this.lastResult.rows && this.lastResult.rows.length);
        var isRow = Boolean(hasResult && target && (target.tagName === 'TR' || $u(target).closest('tbody tr').length));
        var isCell = Boolean(hasResult && target && (target.tagName === 'TD' || target.tagName === 'TH' || $u(target).closest('td, th').length));

        contextmenu.items.forEach((item: any) => {
          if (item.label == "Copy") {
            item.enabled = isTextSelected;
          }
          if (item.label && item.label.startsWith("Copy Row")) {
            item.enabled = isRow;
          }
          if (item.label && item.label.startsWith("Copy Column")) {
            item.enabled = isCell;
          }
          if (item.label && item.label.startsWith("Copy All")) {
            item.enabled = hasResult;
          }
        });
      }
    });
  }

  copyResultsMenu () {
    if (!this.copyButton || !this.copyButton.length) return;
    if (!this.lastResult || !this.lastResult.rows || !this.lastResult.rows.length) {
      if (window.alertify && typeof window.alertify.log === 'function') {
        window.alertify.log('No query results to copy');
      }
      return;
    }

    var menuActions = {
      'Copy as JSON': () => this.copyAllResultsAsJson(),
      'Copy as Markdown': () => this.copyAllResultsAsMarkdown(),
      'Copy as CSV': () => this.copyAllResultsAsCsv()
    };

    var btn = this.copyButton[0];
    var rect = btn.getBoundingClientRect();
    (btn as any).contextmenu = null;
    $u.contextMenu(this.copyButton, menuActions);
    btn.dispatchEvent(new MouseEvent('contextmenu', {
      clientX: rect.left,
      clientY: rect.bottom + 2,
      bubbles: true
    }));
  }

  copyResultRowAsJson (tr: HTMLElement) {
    if (!tr || !this.lastResult || !this.lastResult.rows) return;
    var rowIndex = dom.elementIndex(tr);
    var row = this.lastResult.rows[rowIndex];
    if (!row) return;

    var json = formatUtil.rowToJson(this.lastResult.fields, row);
    formatUtil.copyToClipboard(json);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success("Row copied as JSON");
    }
  }

  copyResultRowAsMarkdown (tr: HTMLElement) {
    if (!tr || !this.lastResult || !this.lastResult.rows) return;
    var rowIndex = dom.elementIndex(tr);
    var row = this.lastResult.rows[rowIndex];
    if (!row) return;

    var md = formatUtil.rowsToMarkdown(this.lastResult.fields, [row]);
    formatUtil.copyToClipboard(md);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success("Row copied as Markdown");
    }
  }

  copyResultColumnAsInClause (cell: HTMLElement) {
    if (!cell || !this.lastResult || !this.lastResult.rows || !this.lastResult.rows.length) return;
    var colIndex = dom.elementIndex(cell);
    var cleanFields = formatUtil.cleanFieldNames(this.lastResult.fields || []);
    var colName = cleanFields[colIndex] || `col_${colIndex + 1}`;
    var rows = this.lastResult.completeRows || this.lastResult.rows;

    var values = rows.map((r: any) => {
      if (Array.isArray(r)) return r[colIndex];
      return r[colName];
    });

    var inClause = formatUtil.columnToInClause(values);
    formatUtil.copyToClipboard(inClause);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success(`Copied column "${colName}" as IN (...) (${values.length} rows)`);
    }
  }

  copyAllResultsAsJson () {
    if (!this.lastResult || !this.lastResult.rows || !this.lastResult.rows.length) {
      if (window.alertify && typeof window.alertify.log === 'function') {
        window.alertify.log("No query results to copy");
      }
      return;
    }
    var rows = this.lastResult.completeRows || this.lastResult.rows;
    var json = formatUtil.rowsToJson(this.lastResult.fields, rows);
    formatUtil.copyToClipboard(json);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success(`Copied ${rows.length} results as JSON`);
    }
  }

  copyAllResultsAsMarkdown () {
    if (!this.lastResult || !this.lastResult.rows || !this.lastResult.rows.length) {
      if (window.alertify && typeof window.alertify.log === 'function') {
        window.alertify.log("No query results to copy");
      }
      return;
    }
    var rows = this.lastResult.completeRows || this.lastResult.rows;
    var md = formatUtil.rowsToMarkdown(this.lastResult.fields, rows);
    formatUtil.copyToClipboard(md);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success(`Copied ${rows.length} results as Markdown`);
    }
  }

  copyAllResultsAsCsv () {
    if (!this.lastResult || !this.lastResult.rows || !this.lastResult.rows.length) {
      if (window.alertify && typeof window.alertify.log === 'function') {
        window.alertify.log("No query results to copy");
      }
      return;
    }
    var rows = this.lastResult.completeRows || this.lastResult.rows;
    var colNames = formatUtil.cleanFieldNames(this.lastResult.fields || []);
    var csv = serializeToCsv(colNames, rows);
    formatUtil.copyToClipboard(csv);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success(`Copied ${rows.length} results as CSV`);
    }
  }

}


declare var Query__: typeof Query


module.exports = Query;