require('./test_helper');

import * as fs from 'fs';
import * as path from 'path';
import { AILogger } from '../lib/local_ai/logger';

describe('AILogger Unit Tests', () => {
  const testLogPath = path.resolve(process.cwd(), '.test-ai.log');

  beforeEach(() => {
    AILogger.setLogFilePath(testLogPath);
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
    // Restore default
    AILogger.setLogFilePath(path.resolve(process.cwd(), '.postbird-ai.log'));
  });

  it('logs info, warn, and error messages to file', () => {
    AILogger.info('Testing info message', { meta: 'value1' });
    AILogger.warn('Testing warning message', 'warn detail');
    AILogger.error('Testing error message', new Error('sample failure'));

    assert(fs.existsSync(testLogPath), 'Log file should be created');
    const content = fs.readFileSync(testLogPath, 'utf8');

    assert(content.includes('[INFO] Testing info message | {"meta":"value1"}'));
    assert(content.includes('[WARN] Testing warning message | warn detail'));
    assert(content.includes('[ERROR] Testing error message'));
    assert(content.includes('sample failure'));
  });

  it('logs prompt execution with provider and preview', () => {
    AILogger.logPrompt('claude', 'SELECT * FROM users WHERE active = true;', { model: 'claude-3-5-sonnet' });

    assert(fs.existsSync(testLogPath));
    const content = fs.readFileSync(testLogPath, 'utf8');
    assert(content.includes('[claude] Prompt sent: "SELECT * FROM users WHERE active = true;" (model: claude-3-5-sonnet)'));
  });

  it('logs CLI process spawning commands', () => {
    AILogger.logCli('claude', '/usr/local/bin/claude', ['-p', 'SELECT 1;', '--verbose']);

    assert(fs.existsSync(testLogPath));
    const content = fs.readFileSync(testLogPath, 'utf8');
    assert(content.includes('[claude] Spawning CLI process: /usr/local/bin/claude -p "SELECT 1;" --verbose'));
  });

  it('logs streaming start, chunks, and completion stats', () => {
    AILogger.logStreamStart('agy', 'gemini-3.8-flash');
    AILogger.logStreamChunk('agy', 25, 25);
    AILogger.logStreamEnd('agy', 25, 120);

    assert(fs.existsSync(testLogPath));
    const content = fs.readFileSync(testLogPath, 'utf8');
    assert(content.includes('[agy] Stream started (gemini-3.8-flash)'));
    assert(content.includes('[agy] Stream finished successfully: 25 characters in 120ms'));
  });

  it('logs formatted errors with context and stack', () => {
    AILogger.logError('claude', new Error('OAuth session expired'), 'CLI authentication');

    assert(fs.existsSync(testLogPath));
    const content = fs.readFileSync(testLogPath, 'utf8');
    assert(content.includes('[claude] Error during CLI authentication: OAuth session expired'));
  });
});
