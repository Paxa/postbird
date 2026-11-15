require('./test_helper');

const {
  createAIConnector,
  discoverProviders,
  findBinary,
  FmAdapter,
  AgyAdapter,
  ClaudeAdapter,
  OpenAICompatibleAdapter
} = require('../lib/local_ai');

describe('Local AI Connector & Discovery Engine', () => {

  it('locates local CLI binaries using candidate path scanner', () => {
    // /usr/bin/fm should be found on this macOS machine
    const fm = findBinary('fm');
    assert(fm !== null, 'Should discover fm binary on macOS');
  });

  it('discovers installed local providers and custom endpoints', async () => {
    const providers = await discoverProviders([
      {
        id: 'corp-gateway',
        name: 'Corporate LiteLLM Gateway',
        baseUrl: 'http://127.0.0.1:4000/v1',
        model: 'qwen2.5-coder'
      }
    ]);

    assert(Array.isArray(providers), 'discoverProviders must return an array');
    assert(providers.length > 0, 'Should have discovered at least 1 provider');

    const custom = providers.find((p: any) => p.id === 'corp-gateway');
    assert(custom, 'Custom endpoint must be present in discovery list');
    assert.equal(custom.status, 'ready');
    assert.equal(custom.models[0], 'qwen2.5-coder');

    const fm = providers.find((p: any) => p.id === 'fm');
    if (fm) {
      assert(fm.models.includes('system (Apple On-Device ~3B)'), 'FM model should be system');
    }

    const agy = providers.find((p: any) => p.id === 'agy');
    if (agy) {
      assert.equal(agy.status, 'ready');
      assert.equal(agy.name, 'Antigravity CLI (agy)');
      assert(agy.path.includes('agy'), 'agy path must be populated');
    }
  });

  it('builds safe, sandboxed CLI arguments for Claude Code', () => {
    const claude = new ClaudeAdapter();
    const args = claude.buildArgs({
      prompt: 'SELECT 1;',
      system: 'Output SQL only',
      model: 'sonnet'
    });

    assert(args.includes('--tools'), 'Claude must configure tools flag');
    assert(args.includes(''), 'Claude tools must be empty string for pure LLM mode');
    assert(args.includes('--disable-slash-commands'), 'Claude must disable slash commands');
    assert(args.includes('--no-session-persistence'), 'Claude must disable session persistence');
    assert(args.includes('--system-prompt'), 'Claude must include system prompt');
    assert(args.some(a => a.includes('Output SQL only')), 'Claude must pass system instructions');
  });

  it('builds headless non-interactive CLI arguments for Antigravity (agy)', () => {
    const agy = new AgyAdapter();
    const args = agy.buildArgs({
      prompt: 'Find active users',
      system: 'PostgreSQL expert',
      model: 'gemini-3.8-flash-medium',
      jsonSchema: { type: 'object', properties: { sql: { type: 'string' } } }
    });

    assert(args.includes('-p'), 'agy must run in non-interactive print mode (-p)');
    assert(args.includes('--disable-slash-commands'), 'agy must disable slash commands');
    assert(args.includes('--sandbox'), 'agy must run with terminal sandbox restrictions');
    assert(args.includes('--settings'), 'agy must pass security policy deny settings');
    assert(!args.includes('--dangerously-skip-permissions'), 'agy must NOT skip permissions or auto-execute tools');
    assert(args.includes('--output-format'), 'agy must specify output-format');
    assert(args.includes('stream-json'), 'agy must request stream-json');
    assert(args.includes('--model'), 'agy must specify model');
    assert(args.includes('--json-schema'), 'agy must pass json-schema when provided');
  });

  it('builds CLI arguments for macOS Apple Foundation Model (fm)', () => {
    const fm = new FmAdapter();
    const args = fm.buildArgs({
      prompt: 'Explain query plan',
      system: 'Act as DBA',
      jsonSchema: { type: 'object' }
    }, true);

    assert.equal(args[0], 'respond', 'fm command must start with respond');
    assert(args.includes('-i'), 'fm must pass instructions (-i)');
    assert(args.includes('Act as DBA'), 'fm must pass system instruction text');
    assert(args.includes('--stream'), 'fm must include stream flag');
    assert(args.includes('--schema'), 'fm must include schema flag');
  });

  it('OpenAI-compatible adapter correctly constructs headers and payload', () => {
    const adapter = new OpenAICompatibleAdapter({
      id: 'custom-ai',
      name: 'Custom Server',
      baseUrl: 'http://localhost:8000/v1',
      apiKey: 'sk-test-token'
    });

    assert.equal(adapter.id, 'custom-ai');
    assert.equal(adapter.baseUrl, 'http://localhost:8000/v1');

    const headers = (adapter as any).buildHeaders();
    assert.equal(headers['Authorization'], 'Bearer sk-test-token');
    assert.equal(headers['Content-Type'], 'application/json');

    const messages = (adapter as any).buildMessages({
      prompt: 'Hello',
      system: 'You are an assistant'
    });
    assert.equal(messages.length, 2);
    assert.equal(messages[0].role, 'system');
    assert.equal(messages[1].role, 'user');
  });

  it('createAIConnector initializes and exposes router methods', async () => {
    const connector = createAIConnector();
    assert(typeof connector.listProviders === 'function');
    assert(typeof connector.generateText === 'function');
    assert(typeof connector.streamText === 'function');
    assert(typeof connector.generateObject === 'function');

    const providers = await connector.listProviders();
    assert(Array.isArray(providers));
  });

  it('usage_tracker tracks usage, extracts rate-limit headers, and ignores empty providers in summary', () => {
    const {
      extractRateLimitQuota,
      recordAiUsage,
      getAiUsageSummary,
      saveProviderQuota,
      getProviderQuota,
    } = require('../lib/local_ai/usage_tracker');

    const headers = new Headers({
      'x-ratelimit-limit-requests': '100',
      'x-ratelimit-remaining-requests': '95',
      'x-ratelimit-limit-tokens': '50000',
      'x-ratelimit-remaining-tokens': '48000',
    });
    const quota = extractRateLimitQuota(headers);
    assert(quota);
    assert.equal(quota.requestsLimit, 100);
    assert.equal(quota.requestsRemaining, 95);
    assert.equal(quota.source, 'api-headers');

    const storage = (globalThis as any).window.localStorage;
    const prevUsage = storage.getItem('postbird_ai_usage_log');
    const prevQuotas = storage.getItem('postbird_ai_provider_quotas');

    try {
      const now = Date.now();
      storage.setItem('postbird_ai_usage_log', JSON.stringify([
        { timestamp: now - 1000, provider: '', tokens: 50 },
        { timestamp: now - 500, provider: 'claude', tokens: 120 },
      ]));
      recordAiUsage({ timestamp: now, provider: 'agy', tokens: 80 });

      const claudeSummary = getAiUsageSummary('claude', now);
      assert.equal(claudeSummary.last5h.requests, 1);
      assert.equal(claudeSummary.last5h.tokens, 120);
      assert.equal(claudeSummary.totalLast5h.requests, 3);
      assert.equal(claudeSummary.totalLast5h.tokens, 250);

      saveProviderQuota('openai-1', quota);
      const loaded = getProviderQuota('openai-1');
      assert.equal(loaded?.tokensRemaining, 48000);
    } finally {
      if (prevUsage === null) storage.removeItem('postbird_ai_usage_log');
      else storage.setItem('postbird_ai_usage_log', prevUsage);
      if (prevQuotas === null) storage.removeItem('postbird_ai_provider_quotas');
      else storage.setItem('postbird_ai_provider_quotas', prevQuotas);
    }
  });

  it('spawnAsync runs commands asynchronously and enforces timeouts without blocking', async () => {
    const { spawnAsync } = require('../lib/local_ai/discovery');
    const okRes = await spawnAsync(process.execPath, ['-e', 'console.log("async-ok")'], 2000);
    assert.equal(okRes.status, 0);
    assert(okRes.stdout.includes('async-ok'));

    const timeoutRes = await spawnAsync(process.execPath, ['-e', 'setTimeout(() => {}, 5000)'], 80);
    assert.equal(timeoutRes.status, null);
  });

});

export {};
