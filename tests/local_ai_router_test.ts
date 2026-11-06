require('./test_helper');

import { AIRouter } from '../lib/local_ai/router';
import { BaseAdapter } from '../lib/local_ai/adapters/base';
import { CompletionOptions, DiscoveredProvider } from '../lib/local_ai/types';
import * as discoveryModule from '../lib/local_ai/discovery';

describe('AIRouter Unit Tests', () => {

  it('initializes with default built-in adapters', async () => {
    const router = new AIRouter();
    const adapters = (router as any).adapters as Map<string, BaseAdapter>;

    assert(adapters.has('fm'), 'Router should register FmAdapter by default');
    assert(adapters.has('agy'), 'Router should register AgyAdapter by default');
    assert(adapters.has('claude'), 'Router should register ClaudeAdapter by default');
  });

  it('registers custom endpoints on initialization', () => {
    const router = new AIRouter({
      customEndpoints: [
        {
          id: 'groq-cloud',
          name: 'Groq Cloud',
          baseUrl: 'https://api.groq.com/openai/v1',
          apiKey: 'gsk_test123',
          model: 'llama-3.3-70b-versatile',
        },
      ],
      customEndpoint: {
        id: 'openrouter',
        name: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: 'sk-or-v1',
        model: 'anthropic/claude-3.5-sonnet',
      },
    });

    const adapters = (router as any).adapters as Map<string, BaseAdapter>;
    assert(adapters.has('groq-cloud'), 'Should register groq-cloud adapter');
    assert(adapters.has('openrouter'), 'Should register openrouter adapter');

    const groq = adapters.get('groq-cloud') as any;
    assert.equal(groq.baseUrl, 'https://api.groq.com/openai/v1');
    assert.equal(groq.apiKey, 'gsk_test123');
    assert.equal(groq.defaultModel, 'llama-3.3-70b-versatile');
  });

  it('deduplicates customEndpoint when already present in customEndpoints list', () => {
    const sharedEndpoint = {
      id: 'shared-llm',
      name: 'Shared LLM',
      baseUrl: 'http://localhost:8000/v1',
      model: 'qwen',
    };

    const router = new AIRouter({
      customEndpoints: [sharedEndpoint],
      customEndpoint: sharedEndpoint,
    });

    const allCustom = (router as any).getAllCustomEndpoints();
    assert.equal(allCustom.length, 1, 'Should deduplicate identical custom endpoint id');
  });

  it('allows manual registration of adapters via registerAdapter', () => {
    const router = new AIRouter();

    const mockAdapter: BaseAdapter = {
      id: 'mock-agent',
      name: 'Mock Test Agent',
      isAvailable: async () => true,
      generate: async (opts: CompletionOptions) => `Mock response: ${opts.prompt}`,
      async *stream(opts: CompletionOptions) {
        yield 'Mock ';
        yield opts.prompt;
      },
    };

    router.registerAdapter(mockAdapter);
    const adapters = (router as any).adapters as Map<string, BaseAdapter>;
    assert.equal(adapters.get('mock-agent'), mockAdapter);
  });

  it('caches listProviders output unless forceRescan is requested', async () => {
    const router = new AIRouter();
    const mockProviders = [
      {
        id: 'cached-p1',
        name: 'Cached Provider',
        status: 'ready',
        models: ['m1'],
        source: 'local-cli',
      } as DiscoveredProvider,
    ];
    (router as any).cachedProviders = mockProviders;

    const res1 = await router.listProviders();
    assert.equal(res1, mockProviders, 'Should return cached list without scanning');

    // Force rescan clears/repopulates cache
    const res2 = await router.listProviders(true);
    assert(Array.isArray(res2), 'Should return fresh scanned providers array');
    assert(res2 !== mockProviders, 'Should not return old cached reference on forceRescan');
  });

  it('resolves adapter by explicit provider id', async () => {
    const router = new AIRouter();
    const resolved = await router.resolveAdapter('agy');
    assert.equal(resolved.adapter.id, 'agy');
    assert.equal(resolved.adapter.name, 'Antigravity CLI');
  });

  it('resolves custom endpoint on-the-fly if not previously registered', async () => {
    const router = new AIRouter({
      customEndpoints: [
        {
          id: 'vllm-local',
          name: 'vLLM Local Server',
          baseUrl: 'http://127.0.0.1:8000/v1',
          model: 'mistral-7b',
        },
      ],
    });

    // Remove from adapters to simulate dynamic lookup
    (router as any).adapters.delete('vllm-local');

    const resolved = await router.resolveAdapter('vllm-local');
    assert.equal(resolved.adapter.id, 'vllm-local');
    assert.equal((resolved.adapter as any).baseUrl, 'http://127.0.0.1:8000/v1');
  });

  it('auto-resolves first ready provider matching default priority order (agy > claude > ...)', async () => {
    const router = new AIRouter();

    // Mock listProviders to return agy and claude as ready
    router.listProviders = async () => [
      { id: 'claude', name: 'Claude Code', status: 'ready', models: ['sonnet'], defaultModel: 'sonnet', source: 'local-cli' },
      { id: 'agy', name: 'Antigravity', status: 'ready', models: ['gemini-3.8-flash-medium'], defaultModel: 'gemini-3.8-flash-medium', source: 'local-cli' },
      { id: 'fm', name: 'Apple FM', status: 'needs_setup', models: ['system'], source: 'macos-builtin' },
    ];

    const resolved = await router.resolveAdapter('auto');
    assert.equal(resolved.adapter.id, 'agy', 'Agy should take priority over Claude in default priority order');
    assert.equal(resolved.defaultModel, 'gemini-3.8-flash-medium');
  });

  it('auto-resolves respecting custom priorityOrder in configuration', async () => {
    const router = new AIRouter({
      priorityOrder: ['claude', 'agy', 'ollama'],
    });

    router.listProviders = async () => [
      { id: 'agy', name: 'Antigravity', status: 'ready', models: ['gemini-3.8-flash-medium'], defaultModel: 'gemini-3.8-flash-medium', source: 'local-cli' },
      { id: 'claude', name: 'Claude Code', status: 'ready', models: ['sonnet'], defaultModel: 'sonnet', source: 'local-cli' },
    ];

    const resolved = await router.resolveAdapter('auto');
    assert.equal(resolved.adapter.id, 'claude', 'Claude should take precedence when specified first in custom priorityOrder');
  });

  it('auto-resolves and dynamically wraps ready provider with baseUrl as OpenAICompatibleAdapter', async () => {
    const router = new AIRouter();

    router.listProviders = async () => [
      {
        id: 'ollama',
        name: 'Ollama Local',
        status: 'ready',
        baseUrl: 'http://127.0.0.1:11434/v1',
        models: ['llama3.2'],
        defaultModel: 'llama3.2',
        source: 'local-http',
      },
    ];

    const resolved = await router.resolveAdapter('auto');
    assert.equal(resolved.adapter.id, 'ollama');
    assert.equal((resolved.adapter as any).baseUrl, 'http://127.0.0.1:11434/v1');
    assert.equal(resolved.defaultModel, 'llama3.2');
  });

  it('falls back to first ready provider if none match the priority order', async () => {
    const router = new AIRouter({
      priorityOrder: ['nonexistent-1', 'nonexistent-2'],
    });

    router.listProviders = async () => [
      {
        id: 'unique-llm',
        name: 'Unique LLM Gateway',
        status: 'ready',
        baseUrl: 'http://127.0.0.1:9090/v1',
        models: ['custom-model'],
        defaultModel: 'custom-model',
        source: 'custom',
      },
    ];

    const resolved = await router.resolveAdapter('auto');
    assert.equal(resolved.adapter.id, 'unique-llm');
    assert.equal(resolved.defaultModel, 'custom-model');
  });

  it('throws descriptive error when no AI providers are ready on system', async () => {
    const router = new AIRouter();

    router.listProviders = async () => [
      { id: 'fm', name: 'Apple FM', status: 'needs_setup', models: ['system'], source: 'macos-builtin' },
      { id: 'ollama', name: 'Ollama', status: 'offline', models: [], source: 'local-http' },
    ];

    let errorThrown: any = null;
    try {
      await router.resolveAdapter('auto');
    } catch (err) {
      errorThrown = err;
    }

    assert(errorThrown !== null, 'Should have thrown error when no provider is ready');
    assert(errorThrown.message.includes('No ready AI provider detected'));
  });

  it('generates text using resolved adapter and applies defaultModel if omitted', async () => {
    const router = new AIRouter();
    let capturedOptions: CompletionOptions | null = null;

    const mockAdapter = {
      id: 'test-gen',
      name: 'Test Gen Adapter',
      defaultModel: 'model-abc',
      isAvailable: async () => true,
      generate: async (opts: CompletionOptions) => {
        capturedOptions = opts;
        return 'SELECT * FROM users WHERE active = true;';
      },
      async *stream() { yield ''; },
    };

    router.registerAdapter(mockAdapter as any);

    router.listProviders = async () => [
      { id: 'test-gen', name: 'Test Gen', status: 'ready', models: ['model-abc'], defaultModel: 'model-abc', source: 'custom' },
    ];

    const result = await router.generateText({
      prompt: 'Show active users',
      provider: 'test-gen',
    });

    assert.equal(result, 'SELECT * FROM users WHERE active = true;');
    assert(capturedOptions !== null);
    assert.equal((capturedOptions as any).prompt, 'Show active users');
    assert.equal((capturedOptions as any).model, 'model-abc', 'Should apply defaultModel when model is omitted');
  });

  it('streams text chunks using resolved adapter', async () => {
    const router = new AIRouter();

    const mockAdapter: BaseAdapter = {
      id: 'stream-agent',
      name: 'Stream Agent',
      isAvailable: async () => true,
      generate: async () => '',
      async *stream(opts) {
        yield 'SELECT ';
        yield 'count(*) ';
        yield 'FROM ';
        yield 'orders;';
      },
    };

    router.registerAdapter(mockAdapter);

    const chunks: string[] = [];
    for await (const chunk of router.streamText({
      prompt: 'Count orders',
      provider: 'stream-agent',
    })) {
      chunks.push(chunk);
    }

    assert.equal(chunks.join(''), 'SELECT count(*) FROM orders;');
  });

  it('generates parsed JSON object and strips markdown code fences', async () => {
    const router = new AIRouter();

    const mockAdapter: BaseAdapter = {
      id: 'json-agent',
      name: 'JSON Agent',
      isAvailable: async () => true,
      generate: async () => {
        // Return JSON wrapped in markdown fences, typical of LLMs
        return '```json\n{\n  "action": "fix_syntax",\n  "fixedSql": "SELECT 1;",\n  "explanation": "Added semicolon"\n}\n```';
      },
      async *stream() { yield ''; },
    };

    router.registerAdapter(mockAdapter);

    const obj = await router.generateObject({
      prompt: 'Fix SQL syntax',
      provider: 'json-agent',
      schema: { type: 'object' },
    });

    assert.equal(obj.action, 'fix_syntax');
    assert.equal(obj.fixedSql, 'SELECT 1;');
    assert.equal(obj.explanation, 'Added semicolon');
  });

  it('chatStream streams chunks and invokes onChunk callback', async () => {
    const router = new AIRouter();

    const mockAdapter: BaseAdapter = {
      id: 'mock-stream',
      name: 'Mock Stream',
      isAvailable: async () => true,
      generate: async () => 'full answer',
      async *stream() {
        yield 'SELECT ';
        yield 'NOW();';
      },
    };

    router.registerAdapter(mockAdapter);

    const receivedChunks: string[] = [];
    const full = await router.chatStream(
      [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'how to get servers time?' },
      ],
      { provider: 'mock-stream' },
      (chunk) => {
        receivedChunks.push(chunk);
      }
    );

    assert.equal(full, 'SELECT NOW();');
    assert.equal(receivedChunks.join(''), 'SELECT NOW();');
  });

  it('chat returns assistant message content', async () => {
    const router = new AIRouter();

    const mockAdapter: BaseAdapter = {
      id: 'mock-chat',
      name: 'Mock Chat',
      isAvailable: async () => true,
      generate: async (opts) => `Answer for ${opts.prompt}`,
      async *stream() { yield ''; },
    };

    router.registerAdapter(mockAdapter);

    const resp = await router.chat(
      [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'what is vacuum?' },
      ],
      { provider: 'mock-chat' }
    );

    assert.equal(resp.role, 'assistant');
    assert.equal(resp.content, 'Answer for what is vacuum?');
  });

});

export {};
