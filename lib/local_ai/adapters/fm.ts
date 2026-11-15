import cp from 'child_process';
import { BaseAdapter } from './base';
import { CompletionOptions } from '../types';
import { findBinary } from '../discovery';
import { AILogger } from '../logger';
import { runCliStream } from './cli_stream';

export class FmAdapter implements BaseAdapter {
  id = 'fm';
  name = 'Apple Foundation Model';

  async isAvailable(): Promise<boolean> {
    if (process.platform !== 'darwin') return false;
    return !!findBinary('fm');
  }

  buildArgs(options: CompletionOptions, stream: boolean = false): string[] {
    const args: string[] = ['respond'];
    if (options.system) {
      args.push('-i', options.system);
    }
    if (options.jsonSchema) {
      args.push('--schema', JSON.stringify(options.jsonSchema));
    }
    if (stream) {
      args.push('--stream');
    } else {
      args.push('--no-stream');
    }
    args.push('--guardrails', 'permissive-content-transformations');
    if (options.model && options.model !== 'system (Apple On-Device ~3B)') {
      args.push('-m', options.model);
    }
    args.push('--text', options.prompt);
    return args;
  }

  async generate(options: CompletionOptions): Promise<string> {
    const fmBin = findBinary('fm') || '/usr/bin/fm';
    const args = this.buildArgs(options, false);
    AILogger.logCli(this.id, fmBin, args);

    return new Promise((resolve, reject) => {
      const child = cp.spawn(fmBin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let output = '';
      let error = '';

      child.stdout.on('data', (chunk: any) => {
        output += chunk.toString();
        if (options.onToken) options.onToken(chunk.toString());
      });
      child.stderr.on('data', (chunk: any) => {
        error += chunk.toString();
      });

      child.on('error', (err: any) => {
        AILogger.logError(this.id, err, 'spawn error');
        reject(err);
      });
      child.on('close', (code: number) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          const errMsg = `[fm] process exited with code ${code}: ${error.trim() || output.trim()}`;
          AILogger.logError(this.id, new Error(errMsg), `exitCode ${code}`);
          reject(new Error(errMsg));
        }
      });
    });
  }

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    const fmBin = findBinary('fm') || '/usr/bin/fm';
    const args = this.buildArgs(options, true);
    yield* runCliStream({
      id: this.id,
      bin: fmBin,
      args,
      cliLabel: 'fm CLI',
      model: options.model,
      onToken: options.onToken,
    });
  }
}
