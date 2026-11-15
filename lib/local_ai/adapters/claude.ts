import { BaseAdapter } from './base';
import { CompletionOptions } from '../types';
import { findBinary } from '../discovery';
import { AILogger } from '../logger';
import { runCliStream } from './cli_stream';

const getTempDir = () => (typeof process !== 'undefined' && (process.env?.TMPDIR || process.env?.TEMP || process.env?.TMP)) || '/tmp';

export class ClaudeAdapter implements BaseAdapter {
  id = 'claude';
  name = 'Claude Code CLI';

  async isAvailable(): Promise<boolean> {
    return !!findBinary('claude');
  }

  buildArgs(options: CompletionOptions): string[] {
    const sandboxNotice = [
      'You are a pure text and SQL language model assistant for the Postbird PostgreSQL GUI.',
      'You do not have access to tools, files, or execution environments.',
      'NEVER attempt to read or modify local files, execute terminal commands, or call tools.',
      'Respond ONLY with direct text or SQL.'
    ].join(' ');

    const systemPrompt = options.system
      ? `${sandboxNotice}\n\n${options.system}`
      : sandboxNotice;

    const args: string[] = [
      '-p', options.prompt,
      '--tools', '',
      '--disable-slash-commands',
      '--no-session-persistence',
      '--output-format', 'stream-json',
      '--verbose',
      '--include-partial-messages',
      '--system-prompt', systemPrompt
    ];

    if (options.model) {
      args.push('--model', options.model);
    }
    if (options.jsonSchema) {
      args.push('--json-schema', JSON.stringify(options.jsonSchema));
    }

    return args;
  }

  async generate(options: CompletionOptions): Promise<string> {
    let result = '';
    for await (const chunk of this.stream(options)) {
      result += chunk;
    }
    return result;
  }

  private parseNdjsonLine(line: string, totalYielded: number): string {
    let parsed: any;
    try {
      parsed = JSON.parse(line);
    } catch {
      return line;
    }

    let delta = '';
    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
      delta = parsed.delta.text;
    } else if (parsed.type === 'text_delta' && typeof parsed.text === 'string') {
      delta = parsed.text;
    } else if (parsed.type === 'assistant' && parsed.message) {
      if (Array.isArray(parsed.message.content)) {
        for (const part of parsed.message.content) {
          if (part.type === 'text' && part.text) delta += part.text;
        }
      } else if (typeof parsed.message.content === 'string') {
        delta = parsed.message.content;
      }
      if (parsed.error || parsed.is_api_error_message) {
        const errText = delta || parsed.error || 'Claude API authentication or communication error';
        AILogger.logError(this.id, new Error(errText), 'assistant event error');
        throw new Error(errText);
      }
    } else if (parsed.type === 'result') {
      if (parsed.is_error) {
        const errMsg = parsed.result || 'Claude execution failed';
        AILogger.logError(this.id, new Error(errMsg), 'result event error');
        throw new Error(errMsg);
      }
      if (totalYielded === 0 && typeof parsed.result === 'string') {
        delta = parsed.result;
      }
    } else if (parsed.type === 'error' && parsed.error) {
      const errMsg = typeof parsed.error === 'string' ? parsed.error : (parsed.error.message || JSON.stringify(parsed.error));
      AILogger.logError(this.id, new Error(errMsg), 'error event');
      throw new Error(errMsg);
    } else if (parsed.type === 'message' && typeof parsed.content === 'string') {
      delta = parsed.content;
    } else if (typeof parsed.content === 'string') {
      delta = parsed.content;
    } else if (typeof parsed.text === 'string') {
      delta = parsed.text;
    }

    return delta;
  }

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    const bin = findBinary('claude') || 'claude';
    const args = this.buildArgs(options);
    yield* runCliStream({
      id: this.id,
      bin,
      args,
      cliLabel: 'Claude CLI',
      model: options.model,
      spawnOptions: { cwd: getTempDir(), stdio: ['ignore', 'pipe', 'pipe'] },
      onToken: options.onToken,
      parseLine: (line, totalYielded) => this.parseNdjsonLine(line, totalYielded),
    });
  }
}
