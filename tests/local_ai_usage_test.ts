require('./test_helper');

const {
  recordAiUsage,
  getAiUsageSummary,
  extractRateLimitQuota,
  saveProviderQuota,
  getProviderQuota,
  formatDurationRemaining,
  formatResetTime,
} = require('../lib/local_ai');

describe('Local AI Usage & Quota Tracker', () => {
  beforeEach(() => {
    window.localStorage.removeItem('postbird_ai_usage_log');
    window.localStorage.removeItem('postbird_ai_provider_quotas');
    window.localStorage.removeItem('postbird_ai_chat_history');
  });

  it('computes 5h and 7d usage windows per provider and prunes entries older than 7 days', () => {
    const now = Date.now();
    const oneHourAgo = now - 1 * 60 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;

    recordAiUsage({ timestamp: oneHourAgo, provider: 'claude', tokens: 1200 });
    recordAiUsage({ timestamp: twoDaysAgo, provider: 'claude', tokens: 3000 });
    recordAiUsage({ timestamp: oneHourAgo, provider: 'agy', tokens: 500 });
    recordAiUsage({ timestamp: tenDaysAgo, provider: 'claude', tokens: 9999 });

    const claudeSummary = getAiUsageSummary('claude', now);
    assert.equal(claudeSummary.last5h.requests, 1);
    assert.equal(claudeSummary.last5h.tokens, 1200);
    assert.equal(claudeSummary.last5h.resetsInMs, 4 * 60 * 60 * 1000);
    assert.equal(claudeSummary.last7d.requests, 2);
    assert.equal(claudeSummary.last7d.tokens, 4200);
    assert.equal(claudeSummary.last7d.resetsInMs, 5 * 24 * 60 * 60 * 1000);

    const agySummary = getAiUsageSummary('agy', now);
    assert.equal(agySummary.last5h.requests, 1);
    assert.equal(agySummary.last5h.tokens, 500);
    assert.equal(agySummary.last5h.resetsInMs, 4 * 60 * 60 * 1000);
    assert.equal(agySummary.last7d.requests, 1);
    assert.equal(agySummary.last7d.tokens, 500);
  });

  it('formats remaining duration and API reset timestamps cleanly', () => {
    assert.equal(formatDurationRemaining(0), 'now');
    assert.equal(formatDurationRemaining(15 * 60 * 1000), '15m');
    assert.equal(formatDurationRemaining((4 * 60 + 12) * 60 * 1000), '4h 12m');
    assert.equal(formatDurationRemaining((5 * 24 + 6) * 60 * 60 * 1000), '5d 6h');

    const now = Date.UTC(2026, 10, 15, 12, 0, 0);
    assert.equal(formatResetTime('1m30s', now), '2m');
    assert.equal(formatResetTime('2026-11-15T14:30:00Z', now), '2h 30m');
    assert.equal(formatResetTime(String(Math.floor(now / 1000) + 90), now), '2m');
  });

  it('tracks usage per model when modelFilter is provided', () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    recordAiUsage({ timestamp: oneHourAgo, provider: 'agy', model: 'gemini-4-argon', tokens: 2400 });
    recordAiUsage({ timestamp: oneHourAgo, provider: 'agy', model: 'gemini-3.8-flash-medium', tokens: 800 });
    recordAiUsage({ timestamp: oneHourAgo, provider: 'agy', model: 'gemini-4-hydrogen-medium', tokens: 400 });

    const argonSummary = getAiUsageSummary('agy', now, 'gemini-4-argon');
    assert.equal(argonSummary.last5h.requests, 1);
    assert.equal(argonSummary.last5h.tokens, 2400);

    const flashSummary = getAiUsageSummary('agy', now, 'gemini-3.8-flash-medium');
    assert.equal(flashSummary.last5h.requests, 1);
    assert.equal(flashSummary.last5h.tokens, 800);

    const allAgySummary = getAiUsageSummary('agy', now);
    assert.equal(allAgySummary.last5h.requests, 3);
    assert.equal(allAgySummary.last5h.tokens, 3600);
  });

  it('extracts OpenAI and Anthropic rate-limit headers from HTTP responses', () => {
    const headers = new Headers({
      'x-ratelimit-limit-requests': '60',
      'x-ratelimit-remaining-requests': '58',
      'x-ratelimit-reset-requests': '1m30s',
      'x-ratelimit-limit-tokens': '100000',
      'x-ratelimit-remaining-tokens': '98500',
    });

    const quota = extractRateLimitQuota(headers);
    assert(quota, 'Quota should be parsed');
    assert.equal(quota.source, 'api-headers');
    assert.equal(quota.requestsLimit, 60);
    assert.equal(quota.requestsRemaining, 58);
    assert.equal(quota.requestsReset, '1m30s');
    assert.equal(quota.tokensLimit, 100000);
    assert.equal(quota.tokensRemaining, 98500);

    saveProviderQuota('google-ai-studio', quota);
    const loaded = getProviderQuota('google-ai-studio');
    assert.equal(loaded?.requestsRemaining, 58);
  });

  it('renders Usage & Quotas box with Refresh button in AI Settings dialog', () => {
    const html = $u('<div>').append(App.renderView('dialogs/ai_settings')).html();
    assert(html.includes('detail-quota-box'), 'Must render .detail-quota-box');
    assert(html.includes('ai-quota-refresh-btn'), 'Must render .ai-quota-refresh-btn');
    assert(html.includes('quota-5h-val'), 'Must render 5h window value');
    assert(html.includes('quota-7d-val'), 'Must render 7d window value');
    assert(html.includes('quota-api-val'), 'Must render provider quota value');
  });
});

export {};
