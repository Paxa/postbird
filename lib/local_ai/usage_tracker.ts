import { ProviderQuotaInfo } from './types';

export interface AiUsageEntry {
  timestamp: number;
  provider: string;
  model?: string;
  tokens: number;
  durationMs?: number;
}

export interface AiUsageWindowSummary {
  requests: number;
  tokens: number;
  resetsInMs?: number;
}

export interface AiUsageSummary {
  last5h: AiUsageWindowSummary;
  last7d: AiUsageWindowSummary;
  totalLast5h: AiUsageWindowSummary;
  totalLast7d: AiUsageWindowSummary;
}

const USAGE_STORAGE_KEY = 'postbird_ai_usage_log';
const QUOTA_STORAGE_KEY = 'postbird_ai_provider_quotas';
const CHAT_HISTORY_KEY = 'postbird_ai_chat_history';
const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {}
  return null;
}

function normalizeProviderKey(provider?: string): string {
  return (provider || '').toLowerCase().replace(/^openai-compatible-?/i, '').trim();
}

export function extractRateLimitQuota(headers: Headers): ProviderQuotaInfo | undefined {
  if (!headers || typeof headers.get !== 'function') return undefined;

  const parseNum = (val: string | null): number | undefined => {
    if (!val) return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const requestsLimit =
    parseNum(headers.get('x-ratelimit-limit-requests')) ??
    parseNum(headers.get('anthropic-ratelimit-requests-limit'));
  const requestsRemaining =
    parseNum(headers.get('x-ratelimit-remaining-requests')) ??
    parseNum(headers.get('anthropic-ratelimit-requests-remaining'));
  const requestsReset =
    headers.get('x-ratelimit-reset-requests') ||
    headers.get('anthropic-ratelimit-requests-reset') ||
    undefined;

  const tokensLimit =
    parseNum(headers.get('x-ratelimit-limit-tokens')) ??
    parseNum(headers.get('anthropic-ratelimit-tokens-limit'));
  const tokensRemaining =
    parseNum(headers.get('x-ratelimit-remaining-tokens')) ??
    parseNum(headers.get('anthropic-ratelimit-tokens-remaining'));
  const tokensReset =
    headers.get('x-ratelimit-reset-tokens') ||
    headers.get('anthropic-ratelimit-tokens-reset') ||
    undefined;

  if (
    requestsLimit !== undefined ||
    requestsRemaining !== undefined ||
    tokensLimit !== undefined ||
    tokensRemaining !== undefined
  ) {
    return {
      requestsLimit,
      requestsRemaining,
      requestsReset,
      tokensLimit,
      tokensRemaining,
      tokensReset,
      source: 'api-headers',
      updatedAt: Date.now(),
    };
  }

  return undefined;
}

export function loadAiUsageLog(): AiUsageEntry[] {
  const storage = getStorage();
  if (!storage) return [];
  const cutoff = Date.now() - SEVEN_DAYS_MS;

  try {
    const raw = storage.getItem(USAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((e: any) => e && typeof e.timestamp === 'number' && e.timestamp >= cutoff);
      }
    }

    // Backfill from existing chat history if usage log doesn't exist yet
    const chatRaw = storage.getItem(CHAT_HISTORY_KEY);
    if (chatRaw) {
      let fallbackProvider = 'ai';
      try {
        const cfgRaw = storage.getItem('postbird_ai_config');
        if (cfgRaw) {
          const cfg = JSON.parse(cfgRaw);
          if (cfg && cfg.providerId) fallbackProvider = cfg.providerId;
        }
      } catch (e) {}

      const chatParsed = JSON.parse(chatRaw);
      if (Array.isArray(chatParsed)) {
        return chatParsed
          .filter((m: any) => m && m.role === 'assistant' && typeof m.timestamp === 'number' && m.timestamp >= cutoff)
          .map((m: any) => ({
            timestamp: m.timestamp,
            provider: m.provider || fallbackProvider,
            tokens: typeof m.tokens === 'number' ? m.tokens : Math.max(1, Math.round((m.content || '').length / 4)),
            durationMs: m.durationMs,
          }));
      }
    }
  } catch (e) {}

  return [];
}

export function recordAiUsage(entry: AiUsageEntry): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const now = Date.now();
    const cutoff = now - SEVEN_DAYS_MS;
    const list = loadAiUsageLog().filter(e => e.timestamp >= cutoff);
    list.push({
      timestamp: entry.timestamp || now,
      provider: entry.provider || 'ai',
      model: entry.model,
      tokens: Math.max(0, Math.round(entry.tokens || 0)),
      durationMs: entry.durationMs,
    });
    const trimmed = list.length > 500 ? list.slice(-500) : list;
    storage.setItem(USAGE_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {}
}

export function getAiUsageSummary(
  providerId?: string,
  now: number = Date.now(),
  modelFilter?: string | ((model?: string) => boolean)
): AiUsageSummary {
  const entries = loadAiUsageLog();
  const target = normalizeProviderKey(providerId);
  const cutoff5h = now - FIVE_HOURS_MS;
  const cutoff7d = now - SEVEN_DAYS_MS;

  const modelPredicate: ((m?: string) => boolean) | null = typeof modelFilter === 'function'
    ? modelFilter
    : (typeof modelFilter === 'string' && modelFilter.trim() !== '')
      ? (m?: string) => (m || '').toLowerCase() === modelFilter.toLowerCase()
      : null;

  const last5h: AiUsageWindowSummary = { requests: 0, tokens: 0 };
  const last7d: AiUsageWindowSummary = { requests: 0, tokens: 0 };
  const totalLast5h: AiUsageWindowSummary = { requests: 0, tokens: 0 };
  const totalLast7d: AiUsageWindowSummary = { requests: 0, tokens: 0 };

  let oldest5h = Infinity;
  let oldest7d = Infinity;
  let oldestTotal5h = Infinity;
  let oldestTotal7d = Infinity;

  for (const e of entries) {
    if (e.timestamp < cutoff7d) continue;
    const tok = e.tokens || 0;
    const entryProv = normalizeProviderKey(e.provider);
    const matches = (!target || (
      entryProv !== '' &&
      (entryProv === target || entryProv.startsWith(target) || target.startsWith(entryProv))
    )) && (!modelPredicate || modelPredicate(e.model));

    totalLast7d.requests += 1;
    totalLast7d.tokens += tok;
    if (e.timestamp < oldestTotal7d) oldestTotal7d = e.timestamp;
    if (e.timestamp >= cutoff5h) {
      totalLast5h.requests += 1;
      totalLast5h.tokens += tok;
      if (e.timestamp < oldestTotal5h) oldestTotal5h = e.timestamp;
    }

    if (matches) {
      last7d.requests += 1;
      last7d.tokens += tok;
      if (e.timestamp < oldest7d) oldest7d = e.timestamp;
      if (e.timestamp >= cutoff5h) {
        last5h.requests += 1;
        last5h.tokens += tok;
        if (e.timestamp < oldest5h) oldest5h = e.timestamp;
      }
    }
  }

  if (oldest5h < Infinity) last5h.resetsInMs = Math.max(0, oldest5h + FIVE_HOURS_MS - now);
  if (oldest7d < Infinity) last7d.resetsInMs = Math.max(0, oldest7d + SEVEN_DAYS_MS - now);
  if (oldestTotal5h < Infinity) totalLast5h.resetsInMs = Math.max(0, oldestTotal5h + FIVE_HOURS_MS - now);
  if (oldestTotal7d < Infinity) totalLast7d.resetsInMs = Math.max(0, oldestTotal7d + SEVEN_DAYS_MS - now);

  return { last5h, last7d, totalLast5h, totalLast7d };
}

export function formatDurationRemaining(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return 'now';
  const totalMinutes = Math.ceil(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${Math.max(1, mins)}m`;
}

export function formatResetTime(resetStr?: string, now: number = Date.now()): string {
  if (!resetStr) return '';
  const trimmed = resetStr.trim();
  if (!trimmed) return '';

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    let diffMs: number;
    if (num > 1e12) diffMs = num - now;
    else if (num > 1e9) diffMs = num * 1000 - now;
    else diffMs = num * 1000;
    return formatDurationRemaining(diffMs);
  }

  if (/[-T:]/.test(trimmed)) {
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return formatDurationRemaining(parsed - now);
    }
  }

  const durRegex = /(\d+(?:\.\d+)?)\s*(d|h|m|ms|s)/gi;
  let totalMs = 0;
  let matched = false;
  let m: RegExpExecArray | null;
  while ((m = durRegex.exec(trimmed)) !== null) {
    matched = true;
    const val = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    if (unit === 'd') totalMs += val * 86400000;
    else if (unit === 'h') totalMs += val * 3600000;
    else if (unit === 'm') totalMs += val * 60000;
    else if (unit === 's') totalMs += val * 1000;
    else if (unit === 'ms') totalMs += val;
  }
  if (matched) return formatDurationRemaining(totalMs);

  return trimmed;
}

export function saveProviderQuota(providerId: string, quota: ProviderQuotaInfo): void {
  const storage = getStorage();
  if (!storage || !providerId) return;

  try {
    const raw = storage.getItem(QUOTA_STORAGE_KEY);
    const map: Record<string, ProviderQuotaInfo> = raw ? JSON.parse(raw) : {};
    map[providerId] = quota;
    storage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

export function getProviderQuota(providerId: string): ProviderQuotaInfo | undefined {
  const storage = getStorage();
  if (!storage || !providerId) return undefined;

  try {
    const raw = storage.getItem(QUOTA_STORAGE_KEY);
    if (!raw) return undefined;
    const map: Record<string, ProviderQuotaInfo> = JSON.parse(raw);
    return map[providerId];
  } catch (e) {
    return undefined;
  }
}
