import { BaseAdapter } from './base';
import { CompletionOptions, ChatMessage } from '../types';
import { AILogger } from '../logger';

export interface OpenAICompatibleConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  defaultModel?: string;
  headers?: Record<string, string>;
}

export class OpenAICompatibleAdapter implements BaseAdapter {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  defaultModel?: string;
  headers?: Record<string, string>;

  constructor(config: OpenAICompatibleConfig) {
    this.id = config.id;
    this.name = config.name;
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel;
    this.headers = config.headers;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(600),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.headers,
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private resolveModel(options: CompletionOptions): string {
    let model = options.model || this.defaultModel || 'default';
    // Auto-migrate retired gemini-2.5-flash to gemini-3.8-flash
    if (this.baseUrl.includes('generativelanguage.googleapis.com') && model.includes('gemini-2.5-flash')) {
      model = model.replace('gemini-2.5-flash', 'gemini-3.8-flash');
    }
    return model;
  }

  private buildMessages(options: CompletionOptions): ChatMessage[] {
    const messages: ChatMessage[] = [];
    if (options.system) {
      messages.push({ role: 'system', content: options.system });
    }
    if (options.messages && options.messages.length > 0) {
      messages.push(...options.messages);
    } else {
      messages.push({ role: 'user', content: options.prompt });
    }
    return messages;
  }

  async generate(options: CompletionOptions): Promise<string> {
    const model = this.resolveModel(options);
    const payload: any = {
      model,
      messages: this.buildMessages(options),
      stream: false,
    };

    if (options.jsonSchema) {
      payload.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          schema: options.jsonSchema,
          strict: true,
        },
      };
    }

    const endpoint = `${this.baseUrl}/chat/completions`;
    AILogger.info(`[${this.id}] HTTP POST ${endpoint} (model: ${model})`);
    const startTime = Date.now();

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
        signal: options.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        const err = new Error(`[OpenAICompatible ${this.id}] ${res.status}: ${errText}`);
        AILogger.logError(this.id, err, 'HTTP non-200');
        throw err;
      }

      const data: any = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      if (options.onToken) {
        options.onToken(content);
      }
      AILogger.info(`[${this.id}] Response completed in ${Date.now() - startTime}ms (${content.length} chars)`);
      return content;
    } catch (err: any) {
      AILogger.logError(this.id, err, 'generate');
      throw err;
    }
  }

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    const model = this.resolveModel(options);
    const payload: any = {
      model,
      messages: this.buildMessages(options),
      stream: true,
    };

    if (options.jsonSchema) {
      payload.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          schema: options.jsonSchema,
          strict: true,
        },
      };
    }

    const endpoint = `${this.baseUrl}/chat/completions`;
    AILogger.info(`[${this.id}] HTTP Stream POST ${endpoint} (model: ${model})`);
    const startTime = Date.now();
    let totalYielded = 0;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
        signal: options.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        const err = new Error(`[OpenAICompatible ${this.id}] ${res.status}: ${errText}`);
        AILogger.logError(this.id, err, 'HTTP non-200 stream');
        throw err;
      }

      if (!res.body) {
        const err = new Error(`[OpenAICompatible ${this.id}] Response body is null`);
        AILogger.logError(this.id, err, 'stream response');
        throw err;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') return;

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                totalYielded += delta.length;
                if (options.onToken) {
                  options.onToken(delta);
                }
                yield delta;
              }
            } catch (e) {
              // Ignore non-JSON chunks
            }
          }
        }
      }

      AILogger.logStreamEnd(this.id, totalYielded, Date.now() - startTime);
    } catch (err: any) {
      AILogger.logError(this.id, err, 'stream');
      throw err;
    }
  }
}
