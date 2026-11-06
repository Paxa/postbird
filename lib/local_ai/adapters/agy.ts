import cp from 'child_process';
import { BaseAdapter } from './base';
import { CompletionOptions } from '../types';
import { findBinary } from '../discovery';
import { AILogger } from '../logger';

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

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    const bin = findBinary('agy') || 'agy';
    const args = this.buildArgs(options);
    AILogger.logCli(this.id, bin, args);

    const child = cp.spawn(bin, args, {
      cwd: getTempDir(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderr = '';
    let exitCode: number | null = null;
    let spawnError: any = null;

    if (child.stderr) {
      child.stderr.on('data', (chunk: any) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', (err: any) => {
      spawnError = err;
      AILogger.logError(this.id, err, 'spawn error');
    });

    child.on('close', (code: number) => {
      exitCode = code;
    });

    let buffer = '';
    let totalYielded = 0;
    const startTime = Date.now();
    AILogger.logStreamStart(this.id, options.model);

    try {
      for await (const chunk of child.stdout) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            // Handle standard stream-json event deltas and agy NDJSON step events
            let delta = '';
            if (parsed.event === 'step_update' && typeof parsed.step_update?.text_delta === 'string') {
              delta = parsed.step_update.text_delta;
            } else if (parsed.event === 'result' && typeof parsed.result?.response === 'string') {
              // Yield final result response if nothing has been yielded yet
              if (totalYielded === 0) {
                delta = parsed.result.response;
              }
            } else if (parsed.type === 'delta' && typeof parsed.content === 'string') {
              delta = parsed.content;
            } else if (parsed.type === 'message' && typeof parsed.content === 'string') {
              delta = parsed.content;
            } else if (typeof parsed.text === 'string') {
              delta = parsed.text;
            } else if (typeof parsed.delta === 'string') {
              delta = parsed.delta;
            }

            if (delta) {
              totalYielded += delta.length;
              if (options.onToken) options.onToken(delta);
              yield delta;
            }
          } catch (e) {
            // If non-JSON text output arrived
            if (options.onToken) options.onToken(line);
            totalYielded += line.length;
            yield line;
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          let delta = '';
          if (parsed.event === 'step_update' && typeof parsed.step_update?.text_delta === 'string') {
            delta = parsed.step_update.text_delta;
          } else if (parsed.event === 'result' && typeof parsed.result?.response === 'string') {
            if (totalYielded === 0) {
              delta = parsed.result.response;
            }
          } else {
            delta = parsed.content || parsed.text || parsed.delta || '';
          }
          if (delta) {
            totalYielded += delta.length;
            if (options.onToken) options.onToken(delta);
            yield delta;
          }
        } catch (e) {
          totalYielded += buffer.length;
          yield buffer;
        }
      }

      if (spawnError) {
        throw spawnError;
      }

      if (totalYielded === 0) {
        const errDetail = stderr.trim();
        if (exitCode !== null && exitCode !== 0) {
          const msg = errDetail || `Antigravity CLI (agy) exited with code ${exitCode}`;
          AILogger.logError(this.id, new Error(msg), `exitCode ${exitCode}`);
          throw new Error(msg);
        }
        if (errDetail) {
          AILogger.logError(this.id, new Error(errDetail), 'stderr output');
          throw new Error(errDetail);
        }
      } else {
        AILogger.logStreamEnd(this.id, totalYielded, Date.now() - startTime);
      }
    } catch (err: any) {
      AILogger.logError(this.id, err, 'stream execution');
      throw err;
    }
  }
}
