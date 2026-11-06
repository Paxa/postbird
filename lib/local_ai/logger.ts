import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  detail?: string;
  timestamp?: string;
}

const LOG_FILE_NAME = '.postbird-ai.log';
const MAX_LOG_SIZE = 2 * 1024 * 1024; // 2 MB

class AILoggerImpl {
  private logFilePath: string;

  constructor() {
    try {
      this.logFilePath = path.resolve(process.cwd(), LOG_FILE_NAME);
    } catch {
      this.logFilePath = LOG_FILE_NAME;
    }
  }

  public getLogFilePath(): string {
    return this.logFilePath;
  }

  public setLogFilePath(newPath: string) {
    this.logFilePath = newPath;
  }

  private isDevEnvironment(): boolean {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      return true;
    }
    if (typeof window !== 'undefined' && !(window as any).__POSTBIRD_PRODUCTION) {
      return true;
    }
    return false;
  }

  public log(level: LogLevel, message: string, detail?: any) {
    const time = new Date().toISOString();
    const detailStr = detail !== undefined
      ? (typeof detail === 'string' ? detail : (detail instanceof Error ? (detail.stack || detail.message) : JSON.stringify(detail)))
      : undefined;

    // 1. In dev, log to stdout / console
    if (this.isDevEnvironment()) {
      const tag = `[AI ${level.toUpperCase()}]`;
      const fullText = detailStr ? `${tag} ${message} (${detailStr})` : `${tag} ${message}`;
      if (level === 'error') {
        console.error(fullText);
      } else if (level === 'warn') {
        console.warn(fullText);
      } else {
        console.log(fullText);
      }
    }

    // 2. If running inside webview with __postbirdRpc, forward to host process for file writing
    if (typeof window !== 'undefined' && (window as any).__postbirdRpc?.logAi) {
      (window as any).__postbirdRpc.logAi({
        level,
        message,
        detail: detailStr,
        timestamp: time,
      }).catch(() => {});
      return;
    }

    // 3. If running in Node/Bun environment (CLI, tests, host), write directly to log file
    try {
      if (typeof fs !== 'undefined' && fs.appendFileSync) {
        const line = `[${time}] [${level.toUpperCase()}] ${message}${detailStr ? ` | ${detailStr}` : ''}\n`;
        if (fs.existsSync && fs.existsSync(this.logFilePath)) {
          const stat = fs.statSync(this.logFilePath);
          if (stat.size > MAX_LOG_SIZE && fs.readFileSync && fs.writeFileSync) {
            const content = fs.readFileSync(this.logFilePath, 'utf8');
            fs.writeFileSync(this.logFilePath, content.slice(content.length - 500 * 1024) + line);
            return;
          }
        }
        fs.appendFileSync(this.logFilePath, line, 'utf8');
      }
    } catch {
      // Graceful fallback if fs is unavailable or restricted
    }
  }

  public info(message: string, detail?: any) {
    this.log('info', message, detail);
  }

  public warn(message: string, detail?: any) {
    this.log('warn', message, detail);
  }

  public error(message: string, error?: any) {
    this.log('error', message, error);
  }

  public logPrompt(provider: string, prompt: string, options?: any) {
    const model = options?.model ? `model: ${options.model}` : 'default model';
    const preview = prompt.length > 100 ? `${prompt.substring(0, 97)}...` : prompt;
    this.info(`[${provider}] Prompt sent: "${preview.replace(/\n/g, ' ')}" (${model})`, {
      fullPrompt: prompt,
      options: options ? { ...options, prompt: undefined } : undefined,
    });
  }

  public logCli(provider: string, bin: string, args: string[]) {
    this.info(`[${provider}] Spawning CLI process: ${bin} ${args.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}`);
  }

  public logStreamStart(provider: string, model?: string) {
    this.info(`[${provider}] Stream started (${model || 'default model'})`);
  }

  public logStreamChunk(provider: string, chunkLength: number, totalTokens: number) {
    this.log('debug', `[${provider}] Stream chunk received (${chunkLength} chars, total: ${totalTokens})`);
  }

  public logStreamEnd(provider: string, totalTokens: number, durationMs: number) {
    this.info(`[${provider}] Stream finished successfully: ${totalTokens} characters in ${durationMs}ms`);
  }

  public logError(provider: string, error: any, context?: string) {
    const prefix = context ? `[${provider}] Error during ${context}: ` : `[${provider}] Error: `;
    const message = error?.message || String(error);
    this.error(`${prefix}${message}`, error?.stack || error);
  }
}

export const AILogger = new AILoggerImpl();
