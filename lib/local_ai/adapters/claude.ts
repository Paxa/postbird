import cp from 'child_process';
import { BaseAdapter } from './base';
import { CompletionOptions } from '../types';
import { findBinary } from '../discovery';
import { AILogger } from '../logger';

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

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    const bin = findBinary('claude') || 'claude';
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
            let delta = '';

            // Handle streaming deltas
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              delta = parsed.delta.text;
            } else if (parsed.type === 'text_delta' && typeof parsed.text === 'string') {
              delta = parsed.text;
            }
            // Handle assistant message container
            else if (parsed.type === 'assistant' && parsed.message) {
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
            }
            // Handle result event
            else if (parsed.type === 'result') {
              if (parsed.is_error) {
                const errMsg = parsed.result || 'Claude execution failed';
                AILogger.logError(this.id, new Error(errMsg), 'result event error');
                throw new Error(errMsg);
              }
              if (totalYielded === 0 && typeof parsed.result === 'string') {
                delta = parsed.result;
              }
            }
            // Handle general errors in response
            else if (parsed.type === 'error' && parsed.error) {
              const errMsg = typeof parsed.error === 'string' ? parsed.error : (parsed.error.message || JSON.stringify(parsed.error));
              AILogger.logError(this.id, new Error(errMsg), 'error event');
              throw new Error(errMsg);
            }
            // Fallback content extraction
            else if (parsed.type === 'message' && typeof parsed.content === 'string') {
              delta = parsed.content;
            } else if (typeof parsed.content === 'string') {
              delta = parsed.content;
            }

            if (delta) {
              totalYielded += delta.length;
              if (options.onToken) options.onToken(delta);
              yield delta;
            }
          } catch (e: any) {
            // Rethrow explicit errors (auth failed, result error, etc.)
            if (e.message && (e.message.includes('Claude') || e.message.includes('Failed to authenticate') || e.message.includes('OAuth'))) {
              throw e;
            }
            // Fallback for non-JSON lines
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
          if (parsed.type === 'assistant' && parsed.message) {
            if (Array.isArray(parsed.message.content)) {
              for (const part of parsed.message.content) {
                if (part.type === 'text' && part.text) delta += part.text;
              }
            } else if (typeof parsed.message.content === 'string') {
              delta = parsed.message.content;
            }
            if (parsed.error) {
              throw new Error(delta || parsed.error);
            }
          } else if (parsed.type === 'result') {
            if (parsed.is_error) throw new Error(parsed.result || 'Claude execution failed');
            if (totalYielded === 0 && typeof parsed.result === 'string') delta = parsed.result;
          } else {
            delta = parsed.delta?.text || parsed.content || parsed.text || '';
          }

          if (delta) {
            totalYielded += delta.length;
            if (options.onToken) options.onToken(delta);
            yield delta;
          }
        } catch (e: any) {
          if (e.message && (e.message.includes('Claude') || e.message.includes('Failed to authenticate') || e.message.includes('OAuth'))) {
            throw e;
          }
          totalYielded += buffer.length;
          yield buffer;
        }
      }

      if (spawnError) {
        throw spawnError;
      }

      // Check if process exited with non-zero or gave zero tokens with stderr
      if (totalYielded === 0) {
        const errDetail = stderr.trim();
        if (exitCode !== null && exitCode !== 0) {
          const msg = errDetail || `Claude CLI exited with code ${exitCode}`;
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
