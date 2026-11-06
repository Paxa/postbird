import { BaseAdapter } from './adapters/base';
import { FmAdapter } from './adapters/fm';
import { AgyAdapter } from './adapters/agy';
import { ClaudeAdapter } from './adapters/claude';
import { OpenAICompatibleAdapter } from './adapters/openai_compatible';
import { discoverProviders, verifyProvider } from './discovery';
import { DiscoveredProvider, ProviderVerificationResult, CompletionOptions, AIConnectorConfig, CustomEndpointConfig, ChatMessage } from './types';
import { AILogger } from './logger';

export class AIRouter {
  private adapters: Map<string, BaseAdapter> = new Map();
  private config: AIConnectorConfig;
  private cachedProviders: DiscoveredProvider[] | null = null;

  constructor(config: AIConnectorConfig = {}) {
    this.config = config;
    this.registerBuiltInAdapters();
  }

  private registerBuiltInAdapters() {
    this.registerAdapter(new FmAdapter());
    this.registerAdapter(new AgyAdapter());
    this.registerAdapter(new ClaudeAdapter());

    // Register custom endpoints as OpenAI-compatible adapters
    const customList = this.getAllCustomEndpoints();
    for (const endpoint of customList) {
      if (['claude', 'agy', 'fm'].includes(endpoint.id)) continue;
      this.registerAdapter(new OpenAICompatibleAdapter({
        id: endpoint.id,
        name: endpoint.name,
        baseUrl: endpoint.baseUrl,
        apiKey: endpoint.apiKey,
        defaultModel: endpoint.model,
        headers: endpoint.headers,
      }));
    }
  }

  private getAllCustomEndpoints(): CustomEndpointConfig[] {
    const list: CustomEndpointConfig[] = [];
    if (this.config.customEndpoints) {
      list.push(...this.config.customEndpoints);
    }
    if (this.config.customEndpoint) {
      if (!list.some(e => e.id === this.config.customEndpoint!.id)) {
        list.push(this.config.customEndpoint);
      }
    }
    return list;
  }

  public registerAdapter(adapter: BaseAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  public async listProviders(forceRescan: boolean = false): Promise<DiscoveredProvider[]> {
    if (!this.cachedProviders || forceRescan) {
      this.cachedProviders = await discoverProviders(this.getAllCustomEndpoints());
    }
    return this.cachedProviders;
  }

  public async verifyProvider(
    providerId: string,
    options?: { model?: string; baseUrl?: string; apiKey?: string; path?: string }
  ): Promise<ProviderVerificationResult> {
    return await verifyProvider(providerId, options);
  }

  public async resolveAdapter(providerId?: string): Promise<{ adapter: BaseAdapter; defaultModel?: string }> {
    if (providerId && providerId !== 'auto') {
      let adapter = this.adapters.get(providerId);
      if (!adapter) {
        const custom = this.getAllCustomEndpoints().find(e => e.id === providerId);
        if (custom) {
          adapter = new OpenAICompatibleAdapter({
            id: custom.id,
            name: custom.name,
            baseUrl: custom.baseUrl,
            apiKey: custom.apiKey,
            defaultModel: custom.model,
            headers: custom.headers,
          });
          this.registerAdapter(adapter);
        }
      }
      if (adapter) {
        return { adapter, defaultModel: (adapter as any).defaultModel };
      }
    }

    // Auto-select: list ready providers and pick the first by priority
    const providers = await this.listProviders();
    const ready = providers.filter(p => p.status === 'ready');

    const priorityOrder = this.config.priorityOrder || ['agy', 'claude', 'cursor-agent', 'gemini', 'codex', 'ollama', 'fm'];

    for (const id of priorityOrder) {
      const found = ready.find(p => p.id === id);
      if (found) {
        let adapter = this.adapters.get(found.id);
        if (!adapter && found.baseUrl) {
          adapter = new OpenAICompatibleAdapter({
            id: found.id,
            name: found.name,
            baseUrl: found.baseUrl,
            apiKey: found.apiKey,
            defaultModel: found.defaultModel,
          });
          this.registerAdapter(adapter);
        }

        if (adapter) {
          return { adapter, defaultModel: found.defaultModel };
        }
      }
    }

    if (ready.length > 0) {
      const first = ready[0];
      let adapter = this.adapters.get(first.id);
      if (!adapter && first.baseUrl) {
        adapter = new OpenAICompatibleAdapter({
          id: first.id,
          name: first.name,
          baseUrl: first.baseUrl,
          apiKey: first.apiKey,
          defaultModel: first.defaultModel,
        });
        this.registerAdapter(adapter);
      }
      if (adapter) {
        return { adapter, defaultModel: first.defaultModel };
      }
    }

    throw new Error('No ready AI provider detected on this system. Please configure an AI provider in AI Settings.');
  }

  public async generateText(options: CompletionOptions): Promise<string> {
    const { adapter, defaultModel } = await this.resolveAdapter(options.provider);
    const resolvedModel = options.model || defaultModel;
    AILogger.logPrompt(adapter.id, options.prompt, { ...options, model: resolvedModel });
    try {
      return await adapter.generate({
        ...options,
        model: resolvedModel,
      });
    } catch (err) {
      AILogger.logError(adapter.id, err, 'generateText');
      throw err;
    }
  }

  public async *streamText(options: CompletionOptions): AsyncIterable<string> {
    const { adapter, defaultModel } = await this.resolveAdapter(options.provider);
    const resolvedModel = options.model || defaultModel;
    AILogger.logPrompt(adapter.id, options.prompt, { ...options, model: resolvedModel });
    try {
      for await (const chunk of adapter.stream({
        ...options,
        model: resolvedModel,
      })) {
        yield chunk;
      }
    } catch (err) {
      AILogger.logError(adapter.id, err, 'streamText');
      throw err;
    }
  }

  private buildPromptFromMessages(messages: ChatMessage[], explicitPrompt?: string): string {
    if (explicitPrompt) return explicitPrompt;
    const nonSystem = messages.filter(m => m.role !== 'system');
    if (nonSystem.length === 0) return '';
    if (nonSystem.length === 1) return nonSystem[0].content;
    return nonSystem
      .map(m => (m.role === 'assistant' ? `[Assistant]\n${m.content}` : `[User]\n${m.content}`))
      .join('\n\n');
  }

  public async chat(
    messages: ChatMessage[],
    options: Partial<CompletionOptions> = {}
  ): Promise<{ role: 'assistant'; content: string }> {
    const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
    const prompt = this.buildPromptFromMessages(messages, options.prompt);

    const content = await this.generateText({
      ...options,
      prompt,
      system: options.system || system,
      messages,
    });
    return { role: 'assistant', content };
  }

  public async chatStream(
    messages: ChatMessage[],
    options: Partial<CompletionOptions> = {},
    onChunk?: (delta: string) => void
  ): Promise<string> {
    const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
    const prompt = this.buildPromptFromMessages(messages, options.prompt);

    let fullText = '';
    const chunkCallback = onChunk || options.onToken;

    for await (const chunk of this.streamText({
      ...options,
      prompt,
      system: options.system || system,
      messages,
    })) {
      fullText += chunk;
      if (chunkCallback) {
        chunkCallback(chunk);
      }
    }
    return fullText;
  }

  public async generateObject<T = any>(options: CompletionOptions & { schema: Record<string, any> }): Promise<T> {
    const text = await this.generateText({
      ...options,
      jsonSchema: options.schema,
    });

    try {
      return JSON.parse(text);
    } catch (e) {
      // Clean possible markdown code fences (```json ... ```)
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleaned);
    }
  }
}
