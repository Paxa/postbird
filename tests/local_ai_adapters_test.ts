require('./test_helper');

import cp from 'child_process';
import { Readable } from 'stream';
import { AgyAdapter } from '../lib/local_ai/adapters/agy';
import { ClaudeAdapter } from '../lib/local_ai/adapters/claude';
import { FmAdapter } from '../lib/local_ai/adapters/fm';
import { OpenAICompatibleAdapter } from '../lib/local_ai/adapters/openai_compatible';

describe('Local AI Adapters Unit Tests', () => {

  describe('AgyAdapter', () => {
    const agy = new AgyAdapter();

    it('has correct id and display name', () => {
      assert.equal(agy.id, 'agy');
      assert.equal(agy.name, 'Antigravity CLI');
    });

    it('builds standard non-interactive CLI args', () => {
      const args = agy.buildArgs({
        prompt: 'Show users',
      });

      assert(args.includes('-p'), 'Must contain -p flag');
      const pIdx = args.indexOf('-p');
      assert(pIdx !== -1 && args[pIdx + 1].includes('Show users'), 'Must pass prompt');
      assert(args.includes('--disable-slash-commands'), 'Must disable slash commands');
      assert(args.includes('--sandbox'), 'Must enable sandbox mode');
      assert(args.includes('--settings'), 'Must pass security policy deny settings');
      assert(!args.includes('--dangerously-skip-permissions'), 'Must NOT skip permissions or auto-execute tools');
      assert(args.includes('--output-format'), 'Must specify output format');
      assert(args.includes('stream-json'), 'Must use stream-json');
    });

    it('formats system instructions inside prompt for agy CLI', () => {
      const args = agy.buildArgs({
        prompt: 'Generate SQL',
        system: 'You are a PostgreSQL expert',
      });

      const pIndex = args.indexOf('-p');
      assert(pIndex !== -1);
      const fullPrompt = args[pIndex + 1];
      assert(fullPrompt.includes('[System Instructions]'));
      assert(fullPrompt.includes('You are a PostgreSQL expert'));
      assert(fullPrompt.includes('[User Request]\nGenerate SQL'));
    });

    it('includes model and jsonSchema arguments when specified', () => {
      const schema = { type: 'object', properties: { count: { type: 'number' } } };
      const args = agy.buildArgs({
        prompt: 'Count rows',
        model: 'gemini-3.8-flash-medium',
        jsonSchema: schema,
      });

      assert(args.includes('--model'));
      assert(args.includes('gemini-3.8-flash-medium'));
      assert(args.includes('--json-schema'));
      assert(args.includes(JSON.stringify(schema)));
    });

    it('streams and parses JSON output events from spawned agy process', async () => {
      const origSpawn = cp.spawn;
      const tokensReceived: string[] = [];

      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        process.nextTick(() => {
          stdout.push(JSON.stringify({ type: 'delta', content: 'SELECT ' }) + '\n');
          stdout.push(JSON.stringify({ type: 'message', content: '1 ' }) + '\n');
          stdout.push(JSON.stringify({ text: 'FROM ' }) + '\n');
          stdout.push(JSON.stringify({ delta: 'users;' }) + '\n');
          stdout.push(null);
        });

        return {
          stdout,
          stderr: new Readable({ read() {} }),
          on: (ev: string, cb: any) => { if (ev === 'close') process.nextTick(() => cb(0)); },
        };
      };

      try {
        const chunks: string[] = [];
        for await (const chunk of agy.stream({
          prompt: 'Test query',
          onToken: (tok) => tokensReceived.push(tok),
        })) {
          chunks.push(chunk);
        }

        assert.equal(chunks.join(''), 'SELECT 1 FROM users;');
        assert.equal(tokensReceived.join(''), 'SELECT 1 FROM users;');
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });

    it('generates full text by accumulating stream output', async () => {
      const origSpawn = cp.spawn;
      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        process.nextTick(() => {
          stdout.push(JSON.stringify({ type: 'delta', content: 'CREATE TABLE t1 (id int);' }) + '\n');
          stdout.push(null);
        });

        return {
          stdout,
          stderr: new Readable({ read() {} }),
          on: (ev: string, cb: any) => { if (ev === 'close') process.nextTick(() => cb(0)); },
        };
      };

      try {
        const full = await agy.generate({ prompt: 'Create table' });
        assert.equal(full, 'CREATE TABLE t1 (id int);');
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });
  });

  describe('ClaudeAdapter', () => {
    const claude = new ClaudeAdapter();

    it('has correct id and display name', () => {
      assert.equal(claude.id, 'claude');
      assert.equal(claude.name, 'Claude Code CLI');
    });

    it('enforces LLM sandboxing flags (--tools "", no session persistence, disable slash commands)', () => {
      const args = claude.buildArgs({
        prompt: 'Explain query',
        system: 'DBA instruction',
        model: 'sonnet-4-5',
      });

      const toolsIdx = args.indexOf('--tools');
      assert(toolsIdx !== -1, '--tools flag must be present');
      assert.equal(args[toolsIdx + 1], '', '--tools flag must be set to empty string');
      assert(args.includes('--disable-slash-commands'), 'Must disable slash commands');
      assert(args.includes('--no-session-persistence'), 'Must disable session persistence');
      assert(args.includes('--include-partial-messages'), 'Must request partial messages');
      assert(args.includes('--output-format'));
      assert(args.includes('stream-json'));
      assert(args.includes('--verbose'), 'Must pass --verbose for Claude stream-json');
      assert(args.includes('--system-prompt'));
      assert(args.some(a => a.includes('DBA instruction')), 'Must pass DBA instruction');
      assert(args.includes('--model'));
      assert(args.includes('sonnet-4-5'));
    });

    it('streams and parses Claude stream-json events (content_block_delta, text_delta)', async () => {
      const origSpawn = cp.spawn;
      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        process.nextTick(() => {
          stdout.push(JSON.stringify({ type: 'content_block_delta', delta: { text: 'EXPLAIN ' } }) + '\n');
          stdout.push(JSON.stringify({ type: 'text_delta', text: 'ANALYZE ' }) + '\n');
          stdout.push(JSON.stringify({ type: 'message', content: 'SELECT *;' }) + '\n');
          stdout.push(null);
        });

        return {
          stdout,
          stderr: new Readable({ read() {} }),
          on: (ev: string, cb: any) => { if (ev === 'close') process.nextTick(() => cb(0)); },
        };
      };

      try {
        const tokens: string[] = [];
        const chunks: string[] = [];
        for await (const chunk of claude.stream({
          prompt: 'Explain plan',
          onToken: (t) => tokens.push(t),
        })) {
          chunks.push(chunk);
        }

        assert.equal(chunks.join(''), 'EXPLAIN ANALYZE SELECT *;');
        assert.equal(tokens.join(''), 'EXPLAIN ANALYZE SELECT *;');
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });

    it('generates full text response by accumulating stream chunks', async () => {
      const origSpawn = cp.spawn;
      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        process.nextTick(() => {
          stdout.push(JSON.stringify({ type: 'text_delta', text: 'CREATE INDEX ' }) + '\n');
          stdout.push(JSON.stringify({ type: 'content_block_delta', delta: { text: 'idx_users ON users(id);' } }) + '\n');
          stdout.push(null);
        });

        return {
          stdout,
          stderr: new Readable({ read() {} }),
          on: (ev: string, cb: any) => { if (ev === 'close') process.nextTick(() => cb(0)); },
        };
      };

      try {
        const result = await claude.generate({ prompt: 'Create index' });
        assert.equal(result, 'CREATE INDEX idx_users ON users(id);');
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });

    it('gracefully handles raw non-JSON output in stream', async () => {
      const origSpawn = cp.spawn;
      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        process.nextTick(() => {
          stdout.push('Raw plain text chunk\n');
          stdout.push(null);
        });

        return {
          stdout,
          stderr: new Readable({ read() {} }),
          on: (ev: string, cb: any) => { if (ev === 'close') process.nextTick(() => cb(0)); },
        };
      };

      try {
        const chunks: string[] = [];
        for await (const chunk of claude.stream({ prompt: 'Test raw' })) {
          chunks.push(chunk);
        }
        assert.equal(chunks.join(''), 'Raw plain text chunk');
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });

    it('throws descriptive error when Claude returns authentication failure event', async () => {
      const origSpawn = cp.spawn;
      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        process.nextTick(() => {
          stdout.push(JSON.stringify({
            type: 'assistant',
            error: 'authentication_failed',
            is_api_error_message: true,
            message: {
              content: [{ type: 'text', text: 'Failed to authenticate: OAuth session expired and could not be refreshed' }],
            },
          }) + '\n');
          stdout.push(null);
        });

        return {
          stdout,
          stderr: new Readable({ read() {} }),
          on: (ev: string, cb: any) => { if (ev === 'close') process.nextTick(() => cb(1)); },
        };
      };

      try {
        let threw = false;
        try {
          for await (const _ of claude.stream({ prompt: 'test auth' })) {}
        } catch (err: any) {
          threw = true;
          assert(err.message.includes('Failed to authenticate') || err.message.includes('OAuth'));
        }
        assert(threw, 'Should throw authentication error');
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });

    it('throws error with stderr when Claude CLI exits with non-zero code and 0 tokens', async () => {
      const origSpawn = cp.spawn;
      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        const stderr = new Readable({ read() {} });
        process.nextTick(() => {
          stderr.push('Error: When using --print, --output-format=stream-json requires --verbose\n');
          stderr.push(null);
          stdout.push(null);
        });

        return {
          stdout,
          stderr,
          on: (ev: string, cb: any) => { if (ev === 'close') process.nextTick(() => cb(1)); },
        };
      };

      try {
        let threw = false;
        try {
          for await (const _ of claude.stream({ prompt: 'test cli fail' })) {}
        } catch (err: any) {
          threw = true;
          assert(err.message.includes('When using --print') || err.message.includes('code 1'));
        }
        assert(threw, 'Should throw process exit error');
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });
  });

  describe('FmAdapter', () => {
    const fm = new FmAdapter();

    it('has correct id and display name', () => {
      assert.equal(fm.id, 'fm');
      assert.equal(fm.name, 'Apple Foundation Model');
    });

    it('builds CLI args with respond command and flags', () => {
      const args = fm.buildArgs({
        prompt: 'Check indexes',
        system: 'Performance tuning',
        jsonSchema: { type: 'object' },
      }, true);

      assert.equal(args[0], 'respond', 'First argument must be respond');
      assert(args.includes('-i'));
      assert(args.includes('Performance tuning'));
      assert(args.includes('--stream'));
      assert(args.includes('--schema'));
      assert(args.includes('--text'));
      assert(args.includes('Check indexes'));
    });

    it('handles model selection and ignores default system model placeholder', () => {
      const defaultArgs = fm.buildArgs({
        prompt: 'test',
        model: 'system (Apple On-Device ~3B)',
      });
      assert(!defaultArgs.includes('-m'), 'Should omit -m flag for system model');

      const customArgs = fm.buildArgs({
        prompt: 'test',
        model: 'fm-preview-8b',
      });
      const mIdx = customArgs.indexOf('-m');
      assert(mIdx !== -1);
      assert.equal(customArgs[mIdx + 1], 'fm-preview-8b');
    });

    it('generates text on process exit code 0', async () => {
      const origSpawn = cp.spawn;
      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        const stderr = new Readable({ read() {} });
        let closeCb: any;
        const proc = {
          stdout,
          stderr,
          on: (ev: string, cb: any) => {
            if (ev === 'close') closeCb = cb;
          },
        };
        process.nextTick(() => {
          stdout.push('Index scan recommended on users(created_at)\n');
          stdout.push(null);
          process.nextTick(() => {
            if (closeCb) closeCb(0);
          });
        });
        return proc;
      };

      try {
        const out = await fm.generate({ prompt: 'Recommend index' });
        assert.equal(out, 'Index scan recommended on users(created_at)');
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });

    it('rejects generate Promise on process exit code !== 0', async () => {
      const origSpawn = cp.spawn;
      (cp as any).spawn = () => {
        const stdout = new Readable({ read() {} });
        const stderr = new Readable({ read() {} });
        let closeCb: any;
        const proc = {
          stdout,
          stderr,
          on: (ev: string, cb: any) => {
            if (ev === 'close') closeCb = cb;
          },
        };
        process.nextTick(() => {
          stderr.push('License terms not accepted');
          stderr.push(null);
          process.nextTick(() => {
            if (closeCb) closeCb(69);
          });
        });
        return proc;
      };

      try {
        let error: any = null;
        try {
          await fm.generate({ prompt: 'test' });
        } catch (e) {
          error = e;
        }

        assert(error !== null, 'Should reject on exit code 69');
        assert(error.message.includes('code 69'));
        assert(error.message.includes('License terms not accepted'));
      } finally {
        (cp as any).spawn = origSpawn;
      }
    });
  });

  describe('OpenAICompatibleAdapter', () => {
    const adapter = new OpenAICompatibleAdapter({
      id: 'groq-lpu',
      name: 'Groq Cloud',
      baseUrl: 'https://api.groq.com/openai/v1///',
      apiKey: 'gsk_secret_123',
      defaultModel: 'qwen-2.5-coder-32b',
      headers: {
        'X-Custom-Client': 'Postbird',
      },
    });

    it('normalizes trailing slashes on baseUrl', () => {
      assert.equal(adapter.baseUrl, 'https://api.groq.com/openai/v1');
    });

    it('builds request headers with Bearer token and custom headers', () => {
      const headers = (adapter as any).buildHeaders();
      assert.equal(headers['Content-Type'], 'application/json');
      assert.equal(headers['Authorization'], 'Bearer gsk_secret_123');
      assert.equal(headers['X-Custom-Client'], 'Postbird');
    });

    it('omits Authorization header when apiKey is undefined', () => {
      const localAdapter = new OpenAICompatibleAdapter({
        id: 'ollama',
        name: 'Ollama',
        baseUrl: 'http://localhost:11434/v1',
      });

      const headers = (localAdapter as any).buildHeaders();
      assert.equal(headers['Authorization'], undefined);
      assert.equal(headers['Content-Type'], 'application/json');
    });

    it('builds messages combining system instruction and prompt', () => {
      const messages = (adapter as any).buildMessages({
        prompt: 'Find inactive accounts',
        system: 'You are a SQL analyzer',
      });

      assert.equal(messages.length, 2);
      assert.equal(messages[0].role, 'system');
      assert.equal(messages[0].content, 'You are a SQL analyzer');
      assert.equal(messages[1].role, 'user');
      assert.equal(messages[1].content, 'Find inactive accounts');
    });

    it('preserves existing messages array if provided in options', () => {
      const existing = [
        { role: 'user', content: 'What is vacuum in postgres?' },
        { role: 'assistant', content: 'Vacuum reclaims storage.' },
        { role: 'user', content: 'How to automate it?' },
      ];

      const messages = (adapter as any).buildMessages({
        prompt: 'ignored because messages provided',
        messages: existing as any,
      });

      assert.equal(messages.length, 3);
      assert.equal(messages[2].content, 'How to automate it?');
    });

    it('isAvailable returns true when /models endpoint responds with 200 OK', async () => {
      const origFetch = global.fetch;
      (global as any).fetch = async (url: any) => {
        assert(String(url).endsWith('/models'));
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      };

      try {
        const available = await adapter.isAvailable();
        assert.equal(available, true);
      } finally {
        global.fetch = origFetch;
      }
    });

    it('isAvailable returns false on HTTP error or network failure', async () => {
      const origFetch = global.fetch;
      (global as any).fetch = async () => {
        throw new Error('Connection refused');
      };

      try {
        const available = await adapter.isAvailable();
        assert.equal(available, false);
      } finally {
        global.fetch = origFetch;
      }
    });

    it('generate sends POST to /chat/completions and returns choice text', async () => {
      const origFetch = global.fetch;
      let requestedUrl = '';
      let requestBody: any = null;

      (global as any).fetch = async (url: any, opts: any) => {
        requestedUrl = String(url);
        requestBody = JSON.parse(opts.body);
        return new Response(JSON.stringify({
          choices: [
            { message: { content: 'VACUUM (VERBOSE, ANALYZE);' } },
          ],
        }), { status: 200 });
      };

      try {
        const tokens: string[] = [];
        const result = await adapter.generate({
          prompt: 'Optimize table',
          onToken: (tok) => tokens.push(tok),
          jsonSchema: { type: 'object' },
        });

        assert.equal(requestedUrl, 'https://api.groq.com/openai/v1/chat/completions');
        assert.equal(requestBody.model, 'qwen-2.5-coder-32b');
        assert.equal(requestBody.stream, false);
        assert(requestBody.response_format, 'Should attach response_format for jsonSchema');
        assert.equal(result, 'VACUUM (VERBOSE, ANALYZE);');
        assert.equal(tokens[0], 'VACUUM (VERBOSE, ANALYZE);');
      } finally {
        global.fetch = origFetch;
      }
    });

    it('generate throws error on non-200 HTTP response', async () => {
      const origFetch = global.fetch;
      (global as any).fetch = async () => {
        return new Response('Invalid API Key provided', { status: 401 });
      };

      try {
        let err: any = null;
        try {
          await adapter.generate({ prompt: 'test' });
        } catch (e) {
          err = e;
        }

        assert(err !== null);
        assert(err.message.includes('401'));
        assert(err.message.includes('Invalid API Key provided'));
      } finally {
        global.fetch = origFetch;
      }
    });

    it('stream parses Server-Sent Events (SSE) and terminates on [DONE]', async () => {
      const origFetch = global.fetch;

      const sseStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"SELECT "}}]}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"now();"}}]}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global as any).fetch = async () => {
        return new Response(sseStream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        });
      };

      try {
        const chunks: string[] = [];
        const tokens: string[] = [];
        for await (const chunk of adapter.stream({
          prompt: 'Current time',
          onToken: (t) => tokens.push(t),
        })) {
          chunks.push(chunk);
        }

        assert.equal(chunks.join(''), 'SELECT now();');
        assert.equal(tokens.join(''), 'SELECT now();');
      } finally {
        global.fetch = origFetch;
      }
    });
  });

});

export {};
