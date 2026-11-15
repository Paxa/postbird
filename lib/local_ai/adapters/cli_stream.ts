import cp from 'child_process';
import { AILogger } from '../logger';

export interface CliStreamConfig {
  id: string;
  bin: string;
  args: string[];
  cliLabel: string;
  model?: string;
  spawnOptions?: any;
  onToken?: (token: string) => void;
  /**
   * Optional line-based NDJSON parser. When provided, stdout is split into lines
   * (with trailing buffer flushed at EOF) and each non-empty line is passed here.
   * Return the text delta to yield (or empty string to skip).
   */
  parseLine?: (line: string, totalYielded: number) => string;
}

/**
 * Shared child-process streaming helper for CLI-backed AI adapters.
 * Handles process spawning, stderr capture, spawn/exit error reporting,
 * optional NDJSON line buffering, and AILogger stream lifecycle events.
 */
export async function* runCliStream(cfg: CliStreamConfig): AsyncIterable<string> {
  const { id, bin, args, cliLabel, model, spawnOptions, onToken, parseLine } = cfg;
  AILogger.logCli(id, bin, args);

  const child = cp.spawn(bin, args, spawnOptions || { stdio: ['ignore', 'pipe', 'pipe'] });

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
    AILogger.logError(id, err, 'spawn error');
  });

  child.on('close', (code: number) => {
    exitCode = code;
  });

  let buffer = '';
  let totalYielded = 0;
  const startTime = Date.now();
  AILogger.logStreamStart(id, model);

  try {
    for await (const chunk of child.stdout) {
      const text = chunk.toString();
      if (!parseLine) {
        totalYielded += text.length;
        if (onToken) onToken(text);
        yield text;
        continue;
      }

      buffer += text;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const delta = parseLine(line, totalYielded);
        if (delta) {
          totalYielded += delta.length;
          if (onToken) onToken(delta);
          yield delta;
        }
      }
    }

    if (parseLine && buffer.trim()) {
      const delta = parseLine(buffer, totalYielded);
      if (delta) {
        totalYielded += delta.length;
        if (onToken) onToken(delta);
        yield delta;
      }
    }

    if (spawnError) {
      throw spawnError;
    }

    if (totalYielded === 0) {
      const errDetail = stderr.trim();
      if (exitCode !== null && exitCode !== 0) {
        const msg = errDetail || `${cliLabel} exited with code ${exitCode}`;
        AILogger.logError(id, new Error(msg), `exitCode ${exitCode}`);
        throw new Error(msg);
      }
      if (errDetail) {
        AILogger.logError(id, new Error(errDetail), 'stderr output');
        throw new Error(errDetail);
      }
    } else {
      AILogger.logStreamEnd(id, totalYielded, Date.now() - startTime);
    }
  } catch (err: any) {
    AILogger.logError(id, err, 'stream execution');
    throw err;
  }
}
