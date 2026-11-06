require('./test_helper');

import cp from 'child_process';
import {
  getCandidateDirectories,
  findBinary,
  probeHttpEndpoint,
  discoverProviders,
  verifyProvider,
} from '../lib/local_ai/discovery';

describe('Local AI Discovery Engine Unit Tests', () => {

  describe('getCandidateDirectories', () => {
    it('returns an array of unique non-empty directory strings', () => {
      const dirs = getCandidateDirectories();
      assert(Array.isArray(dirs));
      assert(dirs.length > 0);

      const set = new Set(dirs);
      assert.equal(set.size, dirs.length, 'Directory list must not contain duplicates');

      for (const d of dirs) {
        assert(typeof d === 'string' && d.length > 0, 'Every path must be non-empty string');
      }
    });

    it('contains platform standard CLI directories', () => {
      const dirs = getCandidateDirectories();
      if (process.platform === 'darwin') {
        const containsHomebrew = dirs.includes('/opt/homebrew/bin') || dirs.includes('/usr/local/bin');
        assert(containsHomebrew, 'Must include Homebrew bin path on macOS');
      }
    });
  });

  describe('findBinary', () => {
    it('returns null for nonexistent binary', () => {
      const result = findBinary('nonexistent_bin_12345_postbird_test');
      assert.equal(result, null);
    });

    it('returns full absolute path for installed system binaries', () => {
      // 'sh' or 'ls' is universally present on POSIX
      const shPath = findBinary(process.platform === 'win32' ? 'cmd' : 'sh');
      assert(shPath !== null, 'Should find system shell');
      assert(typeof shPath === 'string');
      assert(shPath.endsWith(process.platform === 'win32' ? 'cmd.exe' : 'sh'));
    });
  });

  describe('probeHttpEndpoint', () => {
    it('returns parsed JSON on 200 OK response', async () => {
      const origFetch = global.fetch;
      (global as any).fetch = async () => {
        return new Response(JSON.stringify({ status: 'ok', models: ['test-model'] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      try {
        const res = await probeHttpEndpoint('http://localhost:11434/api/tags');
        assert(res !== null);
        assert.equal(res.status, 'ok');
        assert.equal(res.models[0], 'test-model');
      } finally {
        global.fetch = origFetch;
      }
    });

    it('returns null on 404 or error HTTP response', async () => {
      const origFetch = global.fetch;
      (global as any).fetch = async () => {
        return new Response('Not found', { status: 404 });
      };

      try {
        const res = await probeHttpEndpoint('http://localhost:11434/api/tags');
        assert.equal(res, null);
      } finally {
        global.fetch = origFetch;
      }
    });

    it('returns null when fetch throws network error or times out', async () => {
      const origFetch = global.fetch;
      (global as any).fetch = async () => {
        throw new Error('Connection refused: ECONNREFUSED');
      };

      try {
        const res = await probeHttpEndpoint('http://localhost:9999/api/tags');
        assert.equal(res, null);
      } finally {
        global.fetch = origFetch;
      }
    });
  });

  describe('discoverProviders', () => {
    it('delegates to window.__postbirdRpc.discoverAiProviders when in Electrobun webview', async () => {
      const mockRpcProviders = [
        {
          id: 'host-agy',
          name: 'Antigravity Host CLI',
          status: 'ready' as const,
          models: ['gemini-3.8-flash-medium'],
          source: 'local-cli' as const,
        },
      ];

      const origRpc = (window as any).__postbirdRpc;
      (window as any).__postbirdRpc = {
        discoverAiProviders: async (params: any) => {
          assert(params.customEndpoints);
          return mockRpcProviders;
        },
      };

      try {
        const providers = await discoverProviders([
          { id: 'custom-1', name: 'Custom', baseUrl: 'http://localhost/v1', model: 'm1' },
        ]);
        assert.equal(providers.length, 1);
        assert.equal(providers[0].id, 'host-agy');
      } finally {
        (window as any).__postbirdRpc = origRpc;
      }
    });

    it('falls back to local scan if RPC throws error', async () => {
      const origRpc = (window as any).__postbirdRpc;
      (window as any).__postbirdRpc = {
        discoverAiProviders: async () => {
          throw new Error('RPC IPC Failure');
        },
      };

      try {
        const providers = await discoverProviders([
          { id: 'fallback-custom', name: 'Fallback Endpoint', baseUrl: 'http://localhost/v1', model: 'm1' },
        ]);
        assert(Array.isArray(providers));
        assert(providers.some(p => p.id === 'fallback-custom'));
      } finally {
        (window as any).__postbirdRpc = origRpc;
      }
    });

    it('maps passed customEndpoints to DiscoveredProvider items with source: custom', async () => {
      // Ensure webview RPC is unset during direct scan test
      const origRpc = (window as any).__postbirdRpc;
      (window as any).__postbirdRpc = undefined;

      try {
        const providers = await discoverProviders([
          {
            id: 'groq-lpu',
            name: 'Groq Cloud LPU',
            baseUrl: 'https://api.groq.com/openai/v1',
            apiKey: 'gsk_123',
            model: 'qwen-2.5-coder-32b',
          },
        ]);

        const groq = providers.find(p => p.id === 'groq-lpu');
        assert(groq !== undefined, 'Custom endpoint should be in providers list');
        assert.equal(groq.name, 'Groq Cloud LPU');
        assert.equal(groq.status, 'ready');
        assert.equal(groq.baseUrl, 'https://api.groq.com/openai/v1');
        assert.equal(groq.apiKey, 'gsk_123');
        assert.equal(groq.source, 'custom');
        assert.equal(groq.defaultModel, 'qwen-2.5-coder-32b');
      } finally {
        (window as any).__postbirdRpc = origRpc;
      }
    });

    it('properly identifies Apple FM status as needs_setup when license not agreed', async () => {
      if (process.platform !== 'darwin') return;

      const origRpc = (window as any).__postbirdRpc;
      (window as any).__postbirdRpc = undefined;

      const origSpawnSync = cp.spawnSync;
      // Mock spawnSync for fm license --status returning 'Not agreed'
      (cp as any).spawnSync = (cmd: string, args: string[]) => {
        if (args && args.includes('license')) {
          return {
            status: 69,
            stdout: "Not agreed. Run 'sudo fm license' to review and agree.\n",
            stderr: '',
          };
        }
        return origSpawnSync(cmd, args);
      };

      try {
        const providers = await discoverProviders();
        const fm = providers.find(p => p.id === 'fm');
        if (fm) {
          assert.equal(fm.status, 'needs_setup', 'fm must be marked needs_setup when license is not agreed');
          assert.equal(fm.commandHint, 'sudo fm license');
        }
      } finally {
        (cp as any).spawnSync = origSpawnSync;
        (window as any).__postbirdRpc = origRpc;
      }
    });

    it('identifies Apple FM status as ready when license is agreed and model is available', async () => {
      if (process.platform !== 'darwin') return;

      const origRpc = (window as any).__postbirdRpc;
      (window as any).__postbirdRpc = undefined;

      const origSpawnSync = cp.spawnSync;
      (cp as any).spawnSync = (cmd: string, args: string[]) => {
        if (args && args.includes('license')) {
          return {
            status: 0,
            stdout: 'Apple Foundation Models CLI license terms have been agreed to.\n',
            stderr: '',
          };
        }
        if (args && args.includes('available')) {
          return {
            status: 0,
            stdout: 'System model available\n',
            stderr: '',
          };
        }
        return origSpawnSync(cmd, args);
      };

      try {
        const providers = await discoverProviders();
        const fm = providers.find(p => p.id === 'fm');
        if (fm) {
          assert.equal(fm.status, 'ready', 'fm must be marked ready when license is agreed and model is available');
        }
      } finally {
        (cp as any).spawnSync = origSpawnSync;
        (window as any).__postbirdRpc = origRpc;
      }
    });

    it('identifies Apple FM status as needs_setup when license is agreed but modelNotReady', async () => {
      if (process.platform !== 'darwin') return;

      const origRpc = (window as any).__postbirdRpc;
      (window as any).__postbirdRpc = undefined;

      const origSpawnSync = cp.spawnSync;
      (cp as any).spawnSync = (cmd: string, args: string[]) => {
        if (args && args.includes('license')) {
          return {
            status: 0,
            stdout: 'Agreed to license FM1 version 1.0\n',
            stderr: '',
          };
        }
        if (args && args.includes('available')) {
          return {
            status: 1,
            stdout: '',
            stderr: 'System model unavailable: modelNotReady\n',
          };
        }
        return origSpawnSync(cmd, args);
      };

      try {
        const providers = await discoverProviders();
        const fm = providers.find(p => p.id === 'fm');
        if (fm) {
          assert.equal(fm.status, 'needs_setup', 'fm must be marked needs_setup when modelNotReady');
          assert.equal(fm.commandHint, 'fm available');
        }
      } finally {
        (cp as any).spawnSync = origSpawnSync;
        (window as any).__postbirdRpc = origRpc;
      }
    });

    it('auto-detects Google AI Studio (Gemini Free Tier) when GEMINI_API_KEY is set in environment', async () => {
      const origRpc = (window as any).__postbirdRpc;
      (window as any).__postbirdRpc = undefined;
      const origGeminiKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'AIzaSyTestFreeTierKey123';

      try {
        const providers = await discoverProviders();
        const googleStudio = providers.find(p => p.id === 'google-ai-studio');
        assert(googleStudio !== undefined, 'google-ai-studio should be auto-discovered when GEMINI_API_KEY is set');
        assert.equal(googleStudio.status, 'ready');
        assert.equal(googleStudio.baseUrl, 'https://generativelanguage.googleapis.com/v1beta/openai');
        assert.equal(googleStudio.apiKey, 'AIzaSyTestFreeTierKey123');
        assert.equal(googleStudio.defaultModel, 'gemini-3.8-flash');
        assert(googleStudio.models.includes('gemini-3.8-flash-lite'));
      } finally {
        if (origGeminiKey === undefined) {
          delete process.env.GEMINI_API_KEY;
        } else {
          process.env.GEMINI_API_KEY = origGeminiKey;
        }
        (window as any).__postbirdRpc = origRpc;
      }
    });
  });

  describe('verifyProvider', () => {
    it('returns error when verifying Claude with expired OAuth session', async () => {
      const origRpc = (window as any).__postbirdRpc;
      (window as any).__postbirdRpc = undefined;

      const origSpawnSync = cp.spawnSync;
      (cp as any).spawnSync = (cmd: string, args: string[]) => {
        if (args && args.includes('auth') && args.includes('status')) {
          return {
            status: 1,
            stdout: '{"loggedIn":false,"authMethod":"none"}\n',
            stderr: '',
          };
        }
        return origSpawnSync(cmd, args);
      };

      try {
        const res = await verifyProvider('claude', { path: '/mock/bin/claude' });
        assert.equal(res.ok, false);
        assert(res.message.includes('OAuth session expired') || res.message.includes('claude auth login'));
      } finally {
        (cp as any).spawnSync = origSpawnSync;
        (window as any).__postbirdRpc = origRpc;
      }
    });

    it('requires API key when verifying cloud endpoint', async () => {
      const res = await verifyProvider('google-ai-studio', {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        apiKey: ''
      });
      assert.equal(res.ok, false);
      assert(res.message.includes('API key is required'));
    });

    it('fetches models dynamically and returns ok when OpenAI-compatible endpoint returns 200', async () => {
      const origFetch = global.fetch;
      (global as any).fetch = async (url: string) => {
        if (url.includes('/models')) {
          return new Response(JSON.stringify({
            data: [
              { id: 'models/gemini-3.8-flash' },
              { id: 'models/gemini-3.8-pro' },
              { id: 'models/text-embedding-004' } // should be filtered out
            ]
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not found', { status: 404 });
      };

      try {
        const res = await verifyProvider('google-ai-studio', {
          baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
          apiKey: 'test-key-123'
        });
        assert.equal(res.ok, true);
        assert(res.message.includes('Connected successfully'));
        assert(Array.isArray(res.models));
        assert(res.models!.includes('gemini-3.8-flash'));
        assert(res.models!.includes('gemini-3.8-pro'));
        assert(!res.models!.includes('text-embedding-004'), 'Embedding models must be filtered out for chat');
      } finally {
        global.fetch = origFetch;
      }
    });
  });

});

export {};
