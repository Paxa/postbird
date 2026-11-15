import { BaseAdapter } from './base';
import { CompletionOptions } from '../types';
import { findBinary } from '../discovery';
import { runCliStream } from './cli_stream';

const getTempDir = () => (typeof process !== 'undefined' && (process.env?.TMPDIR || process.env?.TEMP || process.env?.TMP)) || '/tmp';

export class AgyAdapter implements BaseAdapter {
  id = 'agy';
  name = 'Antigravity CLI';

  async isAvailable(): Promise<boolean> {
    return !!findBinary('agy');
  }

  buildArgs(options: CompletionOptions): string[] {
    const sandboxNotice = [
      'You are a pure text and SQL language model assistant for the Postbird PostgreSQL GUI.',
      'You do not have access to tools, files, or execution environments.',
      'NEVER attempt to read or modify local files, execute terminal commands, or call tools.',
      'Respond ONLY with direct text or SQL.'
    ].join(' ');

    let fullPrompt = options.prompt;
    if (options.system) {
      fullPrompt = `[System Instructions]\n${sandboxNotice}\n\n${options.system}\n\n[User Request]\n${options.prompt}`;
    } else {
      fullPrompt = `[System Instructions]\n${sandboxNotice}\n\n[User Request]\n${options.prompt}`;
    }

    const settings = JSON.stringify({
      permissions: {
        allow: [],
        deny: ['command(*)', 'read_file(*)', 'write_file(*)']
      }
    });

    const args: string[] = [
      '-p', fullPrompt,
      '--disable-slash-commands',
      '--sandbox',
      '--settings', settings,
      '--output-format', 'stream-json'
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
    try {
      const parsed = JSON.parse(line);
      if (parsed.event === 'step_update' && typeof parsed.step_update?.text_delta === 'string') {
        return parsed.step_update.text_delta;
      }
      if (parsed.event === 'result' && typeof parsed.result?.response === 'string') {
        return totalYielded === 0 ? parsed.result.response : '';
      }
      if ((parsed.type === 'delta' || parsed.type === 'message') && typeof parsed.content === 'string') {
        return parsed.content;
      }
      if (typeof parsed.text === 'string') return parsed.text;
      if (typeof parsed.delta === 'string') return parsed.delta;
      if (typeof parsed.content === 'string') return parsed.content;
      return '';
    } catch {
      return line;
    }
  }

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    const bin = findBinary('agy') || 'agy';
    const args = this.buildArgs(options);
    yield* runCliStream({
      id: this.id,
      bin,
      args,
      cliLabel: 'Antigravity CLI (agy)',
      model: options.model,
      spawnOptions: { cwd: getTempDir(), stdio: ['ignore', 'pipe', 'pipe'] },
      onToken: options.onToken,
      parseLine: (line, totalYielded) => this.parseNdjsonLine(line, totalYielded),
    });
  }
}
