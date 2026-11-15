var localAI = require('../../../lib/local_ai');

class AiSettings extends DialogBase {
  providers: any[] = [];
  selectedProviderId: string = 'agy';
  selectedModel: string = '';
  confirmedConfig: any = null;
  onConfirmed?: (cfg: any) => void;

  constructor(handler?: any, options?: any) {
    super(handler, {
      title: "AI Connection Settings",
      dialogClass: "ai-settings-window",
      onConfirmed: options && options.onConfirmed
    });

    this.showWindow();
  }

  async showWindow() {
    var rawConfig = window.localStorage.getItem('postbird_ai_config');
    if (rawConfig) {
      try {
        this.confirmedConfig = JSON.parse(rawConfig);
        // Auto-migrate retired gemini-2.5-flash to gemini-3.8-flash
        if (this.confirmedConfig && typeof this.confirmedConfig.model === 'string' && this.confirmedConfig.model.includes('gemini-2.5')) {
          this.confirmedConfig.model = 'gemini-3.8-flash';
          window.localStorage.setItem('postbird_ai_config', JSON.stringify(this.confirmedConfig));
        }

        // Sanitize CLI providers that accidentally retained cloud baseUrl or apiKey
        if (this.confirmedConfig && ['claude', 'agy', 'fm', 'cursor-agent', 'gemini', 'codex'].includes(this.confirmedConfig.providerId)) {
          if (this.confirmedConfig.baseUrl || this.confirmedConfig.apiKey) {
            delete this.confirmedConfig.baseUrl;
            delete this.confirmedConfig.apiKey;
            window.localStorage.setItem('postbird_ai_config', JSON.stringify(this.confirmedConfig));
          }
        }
      } catch (e) {
        this.confirmedConfig = null;
      }
    }

    var nodes = App.renderView('dialogs/ai_settings');
    this.content = this.renderWindow(this.title, nodes);

    await this.loadProviders();
    this.bindEvents();
  }

  async loadProviders() {
    var connector = localAI.createAIConnector();
    try {
      this.providers = await connector.listProviders();
    } catch (e) {
      this.providers = [];
    }

    // Add Google AI Studio (Free Tier), Groq, and OpenAI cloud presets if not present
    var googleKey = (this.confirmedConfig && this.confirmedConfig.providerId === 'google-ai-studio' ? this.confirmedConfig.apiKey : '');
    var existingGoogle = this.providers.find(p => p.id === 'google-ai-studio');
    const googleModels = ['gemini-3.8-flash', 'gemini-3.8-flash-lite', 'gemini-3.8-pro', 'gemini-3-flash'];
    if (existingGoogle) {
      existingGoogle.models = googleModels;
      existingGoogle.defaultModel = 'gemini-3.8-flash';
      if (googleKey) {
        existingGoogle.apiKey = googleKey;
        existingGoogle.status = 'ready';
      }
    } else {
      this.providers.push({
        id: 'google-ai-studio',
        name: 'Google AI Studio (Gemini Free Tier)',
        status: googleKey ? 'ready' : 'needs_setup',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        models: googleModels,
        defaultModel: 'gemini-3.8-flash',
        hint: 'Free tier API key (no credit card required) from aistudio.google.com/apikey',
        source: 'cloud',
        apiKey: googleKey
      });
    }

    var groqKey = (this.confirmedConfig && this.confirmedConfig.providerId === 'groq-cloud' ? this.confirmedConfig.apiKey : '');
    if (!this.providers.find(p => p.id === 'groq-cloud')) {
      this.providers.push({
        id: 'groq-cloud',
        name: 'Groq Cloud (Fast LPU Inference)',
        status: groqKey ? 'ready' : 'needs_setup',
        baseUrl: 'https://api.groq.com/openai/v1',
        models: ['llama-3.3-70b-versatile', 'qwen-2.5-coder-32b', 'llama-3.1-8b-instant'],
        defaultModel: 'qwen-2.5-coder-32b',
        source: 'cloud',
        apiKey: groqKey
      });
    }

    var customKey = (this.confirmedConfig && this.confirmedConfig.providerId === 'custom-openai' ? this.confirmedConfig.apiKey : '');
    if (!this.providers.find(p => p.id === 'custom-openai')) {
      this.providers.push({
        id: 'custom-openai',
        name: 'Custom OpenAI-Compatible Endpoint',
        status: customKey ? 'ready' : 'needs_setup',
        baseUrl: this.confirmedConfig && this.confirmedConfig.providerId === 'custom-openai' ? this.confirmedConfig.baseUrl : 'https://api.openai.com/v1',
        models: ['gpt-4.1', 'gpt-4o', 'custom-model'],
        defaultModel: 'gpt-4.1',
        source: 'custom',
        apiKey: customKey
      });
    }

    // Restore cached model lists (e.g. live models from agy / OpenAI-compatible endpoints)
    try {
      var cachedModelsRaw = window.localStorage.getItem('postbird_ai_cached_models');
      if (cachedModelsRaw) {
        var cachedModelsMap = JSON.parse(cachedModelsRaw);
        this.providers.forEach(p => {
          if (cachedModelsMap && Array.isArray(cachedModelsMap[p.id]) && cachedModelsMap[p.id].length > 0) {
            p.models = cachedModelsMap[p.id];
          }
        });
      }
    } catch (e) {}

    // Determine initial selection: prioritize local zero-setup CLI (agy, claude, etc.)
    if (this.confirmedConfig && this.confirmedConfig.providerId) {
      this.selectedProviderId = this.confirmedConfig.providerId;
      this.selectedModel = this.confirmedConfig.model || '';
    } else {
      var firstReady = this.providers.find(p => p.status === 'ready' && p.source !== 'cloud' && p.source !== 'custom') ||
                       this.providers.find(p => p.status === 'ready');
      if (firstReady) {
        this.selectedProviderId = firstReady.id;
        this.selectedModel = firstReady.defaultModel || (firstReady.models && firstReady.models[0]) || '';
      }
    }

    this.renderProviderLists();
    this.renderDetailPane();

    // Auto-fetch live models for agy if not cached yet
    var agyProvider = this.providers.find(p => p.id === 'agy' && p.status === 'ready');
    if (agyProvider && agyProvider.models && agyProvider.models.length <= 3) {
      localAI.verifyProvider('agy', { path: agyProvider.path }).then((res: any) => {
        if (res && res.ok && Array.isArray(res.models) && res.models.length > 0) {
          this.updateModelsList(agyProvider, res.models);
        }
      }).catch(() => {});
    }
  }

  renderProviderLists() {
    var detectedList = this.content.find('.detected-list').empty();
    var customList = this.content.find('.custom-list').empty();
    var inactiveList = this.content.find('.inactive-list').empty();

    var readyCount = 0;

    this.providers.forEach(p => {
      var isSelected = p.id === this.selectedProviderId;
      var isConfirmed = this.confirmedConfig && this.confirmedConfig.providerId === p.id;

      var row = $u('<div class="ai-provider-row" data-id="' + p.id + '"></div>');
      if (isSelected) row.addClass('selected');

      var checkDot = $u('<span class="check-dot"></span>');
      if (isSelected) checkDot.text('✓');

      var info = $u('<div class="provider-info"></div>');
      var nameRow = $u('<div class="name-row"></div>');
      nameRow.append($u('<span class="provider-name"></span>').text(p.name));
      if (isConfirmed) {
        nameRow.append($u('<span class="confirmed-badge">Active</span>'));
      }
      info.append(nameRow);

      var subtext = p.path || p.baseUrl || p.hint || '';
      info.append($u('<div class="provider-path"></div>').text(subtext));

      row.append(checkDot);
      row.append(info);

      var badge = $u('<span class="status-badge"></span>');
      if (p.source === 'cloud' || p.source === 'custom') {
        if (p.apiKey) {
          badge.addClass('ready').text('Configured');
        } else {
          badge.addClass('needs-setup').text('API Key Needed');
        }
      } else if (p.status === 'ready') {
        badge.addClass('ready').text('Detected');
        readyCount++;
      } else if (p.status === 'needs_setup') {
        badge.addClass('needs-setup').text('Needs Setup');
      } else if (p.status === 'offline') {
        badge.addClass('offline').text('Offline');
      } else {
        badge.addClass('not-found').text('Not Found');
      }
      row.append(badge);

      row.on('click', () => {
        this.selectedProviderId = p.id;
        var prov = this.providers.find(x => x.id === p.id);
        if (prov) {
          this.selectedModel = prov.defaultModel || (prov.models && prov.models[0]) || '';
        }
        this.renderProviderLists();
        this.renderDetailPane();
      });

      if (p.source === 'cloud' || p.source === 'custom') {
        customList.append(row);
      } else if (p.status === 'ready' || p.status === 'needs_setup') {
        detectedList.append(row);
      } else {
        row.addClass('inactive');
        inactiveList.append(row);
      }
    });

    this.content.find('.ready-count').text(`● ${readyCount} Ready`);
  }

  renderDetailPane() {
    var p = this.providers.find(x => x.id === this.selectedProviderId) || this.providers[0];
    if (!p) return;

    this.content.find('.detail-title').text(p.name);
    this.content.find('.detail-desc').text(p.hint || p.path || p.baseUrl || '');

    var extraContainer = this.content.find('.detail-extra').empty();
    if (p.commandHint) {
      var hintBox = $u('<div class="hint-box"></div>');
      hintBox.append($u('<div class="hint-title">One-Time Setup Command:</div>'));
      hintBox.append($u('<code class="hint-code"></code>').text(p.commandHint));
      extraContainer.append(hintBox);
    }

    var modelSelect = this.content.find('.model-select').empty();
    (p.models || []).forEach((m: string) => {
      var opt = $u('<option></option>').attr('value', m).text(m);
      if (m === this.selectedModel) opt.attr('selected', 'selected');
      modelSelect.append(opt);
    });

    var isCustom = p.source === 'cloud' || p.source === 'custom';
    this.content.find('.base-url-group').toggleClass('is-hidden', !isCustom);
    this.content.find('.api-key-group').toggleClass('is-hidden', !isCustom);

    if (isCustom) {
      this.content.find('.base-url-input').val(p.baseUrl || '');
      this.content.find('.api-key-input').val(p.apiKey || '');
      this.content.find('.auth-val').text(p.apiKey ? '✓ API Key Configured' : 'API Key Required');
    } else {
      this.content.find('.base-url-input').val('');
      this.content.find('.api-key-input').val('');
      this.content.find('.auth-val').text(p.status === 'ready' ? '✓ Ready on CLI' : 'Setup Required');
    }

    var isConfirmed = this.confirmedConfig && this.confirmedConfig.providerId === p.id;
    this.content.find('.ai-confirm-btn').text(isConfirmed ? '✓ Confirmed & Active' : 'Confirm & Use This AI');

    this.content.find('.ai-test-result').addClass('is-hidden').removeClass('success error').empty();
    this.content.find('.ai-test-btn').prop('disabled', false).text('⚡ Test Connection');

    this.renderQuotaBox(p);
  }

  updateModelsList(p: any, models?: string[]) {
    if (!p || !Array.isArray(models) || models.length === 0) return;
    p.models = models;

    try {
      var raw = window.localStorage.getItem('postbird_ai_cached_models');
      var map = raw ? JSON.parse(raw) : {};
      map[p.id] = models;
      window.localStorage.setItem('postbird_ai_cached_models', JSON.stringify(map));
    } catch (e) {}

    if (this.content && p.id === this.selectedProviderId) {
      var modelSelect = this.content.find('.model-select').empty();
      models.forEach((m: string) => {
        var opt = $u('<option></option>').attr('value', m).text(m);
        if (m === this.selectedModel) opt.attr('selected', 'selected');
        modelSelect.append(opt);
      });
      if (!models.includes(this.selectedModel)) {
        this.selectedModel = models[0];
        modelSelect.val(models[0]);
      }
    }
  }

  renderQuotaBox(p: any) {
    if (!this.content || !p) return;

    var activeModel = this.selectedModel || p.defaultModel || (p.models && p.models[0]);
    var supportsModels = Array.isArray(p.models) && p.models.length > 0 && p.id !== 'fm';
    var modelFilter = supportsModels && activeModel ? activeModel : undefined;

    var summary = typeof localAI.getAiUsageSummary === 'function'
      ? localAI.getAiUsageSummary(p.id, undefined, modelFilter)
      : {
          last5h: { requests: 0, tokens: 0 },
          last7d: { requests: 0, tokens: 0 },
          totalLast5h: { requests: 0, tokens: 0 },
          totalLast7d: { requests: 0, tokens: 0 }
        };

    var fmtDur = (ms?: number) => {
      if (ms === undefined) return '';
      return typeof localAI.formatDurationRemaining === 'function'
        ? localAI.formatDurationRemaining(ms)
        : `${Math.max(1, Math.ceil(ms / 60000))}m`;
    };

    var fmtPct = (tokens: number, budget: number) => {
      if (!tokens || budget <= 0) return '0%';
      var pct = (tokens / budget) * 100;
      if (pct < 0.1) return '<0.1%';
      if (pct < 10) return `${pct.toFixed(1)}%`;
      return `${Math.round(pct)}%`;
    };

    var BUDGET_5H = 500000;
    var BUDGET_7D = 5000000;

    var isUnlimitedLocal = p.id === 'fm';

    var formatWindow = (
      w: { requests: number; tokens: number; resetsInMs?: number },
      budget: number
    ) => {
      if (isUnlimitedLocal) {
        if (!w || w.requests === 0) return '0 reqs · 0 tok';
        return `${w.requests} ${w.requests === 1 ? 'req' : 'reqs'} · ${w.tokens.toLocaleString()} tok`;
      }
      if (!w || w.requests === 0) {
        return '0% · 0 reqs · 0 tok';
      }
      var resetStr = w.resetsInMs !== undefined ? ` · resets in ${fmtDur(w.resetsInMs)}` : '';
      return `${fmtPct(w.tokens, budget)} (${w.tokens.toLocaleString()} tok)${resetStr}`;
    };

    this.content.find('.quota-5h-val').text(formatWindow(summary.last5h, BUDGET_5H));
    this.content.find('.quota-7d-val').text(formatWindow(summary.last7d, BUDGET_7D));

    var cachedQuota = typeof localAI.getProviderQuota === 'function'
      ? localAI.getProviderQuota(p.id)
      : undefined;

    var apiRowEl = this.content.find('.quota-api-row');
    var apiValEl = this.content.find('.quota-api-val');
    apiValEl.removeClass('muted');

    if (cachedQuota && cachedQuota.source === 'api-headers') {
      var parts: string[] = [];
      if (cachedQuota.requestsRemaining !== undefined) {
        if (cachedQuota.requestsLimit !== undefined && cachedQuota.requestsLimit > 0) {
          var reqPct = Math.round((cachedQuota.requestsRemaining / cachedQuota.requestsLimit) * 100);
          parts.push(`${reqPct}% req left (${cachedQuota.requestsRemaining.toLocaleString()}/${cachedQuota.requestsLimit.toLocaleString()})`);
        } else {
          parts.push(`${cachedQuota.requestsRemaining.toLocaleString()} req left`);
        }
      }
      if (cachedQuota.tokensRemaining !== undefined) {
        if (cachedQuota.tokensLimit !== undefined && cachedQuota.tokensLimit > 0) {
          var tokPct = Math.round((cachedQuota.tokensRemaining / cachedQuota.tokensLimit) * 100);
          parts.push(`${tokPct}% tok left (${cachedQuota.tokensRemaining.toLocaleString()}/${cachedQuota.tokensLimit.toLocaleString()})`);
        } else {
          parts.push(`${cachedQuota.tokensRemaining.toLocaleString()} tok left`);
        }
      }
      if (parts.length > 0) {
        var text = parts.join(' · ');
        var rawReset = cachedQuota.tokensReset || cachedQuota.requestsReset;
        if (rawReset) {
          var resetFormatted = typeof localAI.formatResetTime === 'function'
            ? localAI.formatResetTime(rawReset)
            : rawReset;
          if (resetFormatted) text += ` · resets in ${resetFormatted}`;
        }
        apiValEl.text(text);
        apiRowEl.show();
        return;
      }
    }

    apiRowEl.hide();
  }

  bindEvents() {
    this.content.find('.ai-quota-refresh-btn').on('click', async () => {
      var p = this.providers.find(x => x.id === this.selectedProviderId);
      if (!p) return;

      var refreshBtn = this.content.find('.ai-quota-refresh-btn');
      refreshBtn.prop('disabled', true).text('↻ ...');

      var baseUrl = this.content.find('.base-url-input').val();
      var apiKey = this.content.find('.api-key-input').val();
      var verifyOpts: any = {
        model: this.selectedModel || p.defaultModel,
        baseUrl: baseUrl ? String(baseUrl).trim() : p.baseUrl,
        apiKey: apiKey ? String(apiKey).trim() : p.apiKey,
        path: p.path
      };

      try {
        var res = await localAI.verifyProvider(p.id, verifyOpts);
        if (res && res.ok && Array.isArray(res.models) && res.models.length > 0) {
          this.updateModelsList(p, res.models);
        }
        if (res && res.quota && typeof localAI.saveProviderQuota === 'function') {
          localAI.saveProviderQuota(p.id, res.quota);
        }
      } catch (e) {
        // Still refresh local usage counters even if remote check fails
      } finally {
        this.renderQuotaBox(p);
        refreshBtn.prop('disabled', false).text('↻ Refresh');
      }
    });

    this.content.find('.ai-test-btn').on('click', async () => {
      var p = this.providers.find(x => x.id === this.selectedProviderId);
      if (!p) return;

      var testBtn = this.content.find('.ai-test-btn');
      var resultBox = this.content.find('.ai-test-result');

      testBtn.prop('disabled', true).text('Testing Connection...');
      resultBox.addClass('is-hidden').removeClass('success error').empty();

      var baseUrl = this.content.find('.base-url-input').val();
      var apiKey = this.content.find('.api-key-input').val();

      var verifyOpts: any = {
        model: this.selectedModel || p.defaultModel,
        baseUrl: baseUrl ? String(baseUrl).trim() : p.baseUrl,
        apiKey: apiKey ? String(apiKey).trim() : p.apiKey,
        path: p.path
      };

      try {
        var res = await localAI.verifyProvider(p.id, verifyOpts);
        resultBox.removeClass('is-hidden');

        if (res.ok) {
          resultBox.addClass('success').text(`✓ ${res.message}`);
          p.status = 'ready';
          if (verifyOpts.baseUrl) p.baseUrl = verifyOpts.baseUrl;
          if (verifyOpts.apiKey) p.apiKey = verifyOpts.apiKey;

          this.content.find('.auth-val').removeClass('error').text(
            p.source === 'cloud' || p.source === 'custom' ? '✓ API Key Verified' : '✓ Verified & Ready'
          );

          // If models were discovered, update dropdown & cache dynamically
          this.updateModelsList(p, res.models);

          if (res.quota && typeof localAI.saveProviderQuota === 'function') {
            localAI.saveProviderQuota(p.id, res.quota);
          }

          this.renderQuotaBox(p);
          this.renderProviderLists();
        } else {
          resultBox.addClass('error').text(`✕ ${res.message}`);
          this.content.find('.auth-val').addClass('error').text('✕ Check Failed');
        }
      } catch (err: any) {
        resultBox.removeClass('is-hidden').addClass('error').text(`✕ Error: ${err.message || String(err)}`);
      } finally {
        testBtn.prop('disabled', false).text('⚡ Test Connection');
      }
    });

    this.content.find('.model-select').on('change', (e: any) => {
      this.selectedModel = e.target.value;
      var p = this.providers.find(x => x.id === this.selectedProviderId);
      if (p) this.renderQuotaBox(p);
    });

    this.content.find('.ai-confirm-btn').on('click', () => {
      var p = this.providers.find(x => x.id === this.selectedProviderId);
      if (!p) return;

      var isCustom = p.source === 'cloud' || p.source === 'custom';
      var baseUrl = isCustom ? this.content.find('.base-url-input').val() : undefined;
      var apiKey = isCustom ? this.content.find('.api-key-input').val() : undefined;

      var cfg: any = {
        confirmed: true,
        providerId: p.id,
        providerName: p.name,
        source: p.source,
        model: this.selectedModel || p.defaultModel || (p.models && p.models[0])
      };

      if (isCustom) {
        cfg.baseUrl = baseUrl ? String(baseUrl).trim() : p.baseUrl;
        cfg.apiKey = apiKey ? String(apiKey).trim() : p.apiKey;
      }

      try {
        window.localStorage.setItem('postbird_ai_config', JSON.stringify(cfg));
      } catch (e) {
        console.warn('Could not save postbird_ai_config', e);
      }

      this.confirmedConfig = cfg;

      if (typeof this.onConfirmed === 'function') {
        this.onConfirmed(cfg);
      }

      // Update provider pill in active query tabs if open
      if (window.App && window.App.currentTab && window.App.currentTab.instance) {
        var queryPane = window.App.currentTab.instance.view && window.App.currentTab.instance.view.queryPane;
        if (queryPane && queryPane.content) {
          queryPane.content.find('.ai-provider-name').text(p.id.split('-')[0]);
        }
      }

      this.close();
    });
  }
}

declare var AiSettings__: typeof AiSettings;

module.exports = AiSettings;
