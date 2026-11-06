import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { DiscoveredProvider, CustomEndpointConfig, ProviderVerificationResult } from './types';

export function getCandidateDirectories(): string[] {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const delimiter = process.platform === 'win32' ? ';' : ':';
  const pathDirs = (process.env.PATH || '').split(delimiter).filter(Boolean);

  const fallbackDirs = process.platform === 'win32'
    ? [
        path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'FoundryLocal'),
        path.join(home, 'AppData', 'Roaming', 'npm'),
        path.join(home, '.bun', 'bin'),
      ]
    : [
        '/opt/homebrew/bin',
        '/usr/local/bin',
        path.join(home, '.local', 'bin'),
        path.join(home, '.bun', 'bin'),
        '/usr/bin',
      ];

  const unique = new Set<string>();
  for (const dir of [...pathDirs, ...fallbackDirs]) {
    if (dir && !unique.has(dir)) {
      unique.add(dir);
    }
  }

  return Array.from(unique);
}

export function findBinary(binName: string): string | null {
  const dirs = getCandidateDirectories();
  const names = process.platform === 'win32'
    ? [binName, `${binName}.exe`, `${binName}.cmd`, `${binName}.bat`]
    : [binName];

  for (const dir of dirs) {
    for (const name of names) {
      const fullPath = path.join(dir, name);
      try {
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          if (stats.isFile()) {
            return fullPath;
          }
        }
      } catch (e) {
        // skip unreadable paths
      }
    }
  }

  return null;
}

export async function probeHttpEndpoint(url: string, timeoutMs: number = 250): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    clearTimeout(timer);
    return null;
  }
}

export async function discoverProviders(customEndpoints: CustomEndpointConfig[] = []): Promise<DiscoveredProvider[]> {
  // If running in Electrobun webview, forward discovery to Bun host via RPC for full host filesystem & PATH access
  if (typeof window !== 'undefined' && (window as any).__postbirdRpc && typeof (window as any).__postbirdRpc.discoverAiProviders === 'function') {
    try {
      const hostProviders = await (window as any).__postbirdRpc.discoverAiProviders({ customEndpoints });
      if (Array.isArray(hostProviders) && hostProviders.length > 0) {
        return hostProviders;
      }
    } catch (e) {
      console.warn('[Discovery RPC Error, falling back to local scan]', e);
    }
  }

  const providers: DiscoveredProvider[] = [];

  // 1. Antigravity CLI (agy) - Top Priority
  const agyPath = findBinary('agy');
  if (agyPath) {
    const defaultModels = ['gemini-3.8-flash-medium', 'gemini-4-argon-medium', 'claude-sonnet-5-5-medium'];
    providers.push({
      id: 'agy',
      name: 'Antigravity CLI (agy)',
      status: 'ready',
      path: agyPath,
      models: defaultModels,
      defaultModel: defaultModels[0],
      source: 'local-cli'
    });
  }

  // 2. Claude Code CLI (claude)
  const claudePath = findBinary('claude');
  if (claudePath) {
    let claudeStatus: DiscoveredProvider['status'] = 'ready';
    let claudeHint: string | undefined;
    let claudeCommandHint: string | undefined;

    try {
      const authRes = cp.spawnSync(claudePath, ['auth', 'status'], {
        timeout: 1500,
        encoding: 'utf8'
      });
      const authOut = `${authRes.stdout || ''}\n${authRes.stderr || ''}`.trim();
      if (authRes.status !== 0 || authOut.includes('"loggedIn":false')) {
        claudeStatus = 'needs_setup';
        claudeHint = 'Claude Code CLI is installed, but your OAuth session expired or is not logged in.';
        claudeCommandHint = 'claude auth login';
      }
    } catch (_err) {
      // Ignore check failure if binary doesn't support `auth status`
    }

    providers.push({
      id: 'claude',
      name: 'Claude Code CLI (claude)',
      status: claudeStatus,
      path: claudePath,
      models: ['sonnet', 'opus', 'claude-sonnet-4-5', 'claude-opus-4-6'],
      defaultModel: 'sonnet',
      hint: claudeHint,
      commandHint: claudeCommandHint,
      source: 'local-cli'
    });
  }

  // 3. Cursor Agent CLI (cursor-agent / agent)
  const cursorPath = findBinary('cursor-agent') || findBinary('agent');
  if (cursorPath) {
    const defaultModels = ['sonnet-4', 'gpt-5', 'sonnet-4-thinking'];
    providers.push({
      id: 'cursor-agent',
      name: 'Cursor Agent CLI (cursor-agent)',
      status: 'ready',
      path: cursorPath,
      models: defaultModels,
      defaultModel: defaultModels[0],
      source: 'local-cli'
    });
  }

  // 4. Gemini CLI (gemini)
  const geminiPath = findBinary('gemini');
  if (geminiPath) {
    providers.push({
      id: 'gemini',
      name: 'Gemini CLI (gemini)',
      status: 'ready',
      path: geminiPath,
      models: ['gemini-3.8-flash', 'gemini-3.8-pro'],
      defaultModel: 'gemini-3.8-flash',
      source: 'local-cli'
    });
  }

  // 5. ChatGPT / OpenAI Codex CLI (codex)
  const codexPath = findBinary('codex');
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const codexAuthExists = fs.existsSync(path.join(home, '.codex', 'auth.json'));

  if (codexPath) {
    providers.push({
      id: 'codex',
      name: 'ChatGPT / OpenAI Codex CLI (codex)',
      status: 'ready',
      path: codexPath,
      models: ['gpt-5', 'o3', 'o4-mini', 'codex-mini-latest'],
      defaultModel: 'gpt-5',
      source: 'local-cli'
    });
  } else if (codexAuthExists) {
    providers.push({
      id: 'codex',
      name: 'ChatGPT / OpenAI Codex CLI (codex)',
      status: 'not_found',
      models: ['gpt-5', 'o3', 'o4-mini'],
      hint: 'codex binary not found in PATH.',
      commandHint: 'npm install -g @openai/codex && codex login',
      source: 'local-cli'
    });
  }

  // 6. Ollama Local Server (:11434)
  const ollamaData = await probeHttpEndpoint('http://127.0.0.1:11434/api/tags', 300);
  const ollamaBin = findBinary('ollama');

  if (ollamaData && Array.isArray(ollamaData.models)) {
    const models = ollamaData.models.map((m: any) => m.name || m.model).filter(Boolean);
    providers.push({
      id: 'ollama',
      name: 'Ollama Local Server',
      status: 'ready',
      path: 'http://127.0.0.1:11434',
      baseUrl: 'http://127.0.0.1:11434/v1',
      models: models.length > 0 ? models : ['qwen2.5-coder', 'llama3.2'],
      defaultModel: models[0] || 'qwen2.5-coder',
      source: 'local-http'
    });
  } else if (ollamaBin) {
    providers.push({
      id: 'ollama',
      name: 'Ollama Local Server',
      status: 'offline',
      path: ollamaBin,
      baseUrl: 'http://127.0.0.1:11434/v1',
      models: ['qwen2.5-coder', 'llama3.2'],
      hint: 'Ollama is installed but not running.',
      commandHint: 'ollama serve',
      source: 'local-http'
    });
  }

  // 7. Microsoft Foundry Local (Windows)
  if (process.platform === 'win32') {
    const foundryPath = findBinary('foundry');
    if (foundryPath) {
      let isServiceRunning = false;
      let servicePort = 5273;
      try {
        const statusRun = cp.spawnSync(foundryPath, ['service', 'status'], { encoding: 'utf-8', timeout: 1000 });
        const out = (statusRun.stdout || '') + (statusRun.stderr || '');
        const portMatch = out.match(/http:\/\/127\.0\.0\.1:(\d+)/i) || out.match(/port\s+(\d+)/i);
        if (portMatch) {
          servicePort = parseInt(portMatch[1], 10);
          isServiceRunning = true;
        }
      } catch (e) {}

      providers.push({
        id: 'foundry',
        name: 'Microsoft Foundry Local (Windows)',
        status: isServiceRunning ? 'ready' : 'offline',
        path: foundryPath,
        baseUrl: `http://127.0.0.1:${servicePort}/v1`,
        models: ['phi-4', 'qwen2.5-0.5b', 'llama-3.2-3b'],
        defaultModel: 'phi-4',
        hint: isServiceRunning ? undefined : 'Service is not running.',
        commandHint: 'foundry service start',
        source: 'windows-native'
      });
    }
  }

  // 8. macOS Apple Foundation Models (/usr/bin/fm)
  if (process.platform === 'darwin') {
    const fmPath = findBinary('fm') || (fs.existsSync('/usr/bin/fm') ? '/usr/bin/fm' : null);
    if (fmPath) {
      let isReady = false;
      let hint: string | undefined;
      let statusHintText = 'Terms not agreed yet or model files removed.';
      try {
        const check = cp.spawnSync(fmPath, ['license', '--status'], { encoding: 'utf-8', timeout: 800 });
        const stdout = ((check.stdout || '') + (check.stderr || '')).toLowerCase();
        if (check.status === 0 && !stdout.includes('not agreed') && (stdout.includes('agreed') || stdout.includes('accepted'))) {
          const avail = cp.spawnSync(fmPath, ['available'], { encoding: 'utf-8', timeout: 800 });
          const availOut = ((avail.stdout || '') + (avail.stderr || '')).toLowerCase();
          if (avail.status === 0 && !availOut.includes('unavailable') && !availOut.includes('modelnotready')) {
            isReady = true;
          } else {
            isReady = false;
            statusHintText = 'Apple Intelligence model weights not ready on disk (modelNotReady).';
            hint = 'fm available';
          }
        } else {
          hint = 'sudo fm license';
        }
      } catch (e) {
        hint = 'sudo fm license';
      }

      providers.push({
        id: 'fm',
        name: 'Apple Foundation Model (fm)',
        status: isReady ? 'ready' : 'needs_setup',
        path: fmPath,
        models: ['system (Apple On-Device ~3B)'],
        defaultModel: 'system (Apple On-Device ~3B)',
        hint: isReady ? undefined : statusHintText,
        commandHint: hint,
        source: 'macos-builtin'
      });
    }
  }

  // 9. Google AI Studio (Gemini Free Tier) via GEMINI_API_KEY / GOOGLE_API_KEY env var
  const envGeminiKey = (typeof process !== 'undefined' && process.env)
    ? (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '')
    : '';
  if (envGeminiKey && !customEndpoints.some(c => c.id === 'google-ai-studio')) {
    providers.push({
      id: 'google-ai-studio',
      name: 'Google AI Studio (Gemini Free Tier)',
      status: 'ready',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      apiKey: envGeminiKey,
      models: ['gemini-3.8-flash', 'gemini-3.8-flash-lite', 'gemini-3.8-pro', 'gemini-3-flash'],
      defaultModel: 'gemini-3.8-flash',
      hint: 'Auto-detected from GEMINI_API_KEY / GOOGLE_API_KEY environment variable.',
      source: 'cloud'
    });
  }

  // 10. Custom Endpoints & Cloud Presets
  for (const custom of customEndpoints) {
    providers.push({
      id: custom.id,
      name: custom.name,
      status: 'ready',
      baseUrl: custom.baseUrl,
      apiKey: custom.apiKey,
      models: [custom.model],
      defaultModel: custom.model,
      source: 'custom'
    });
  }

  return providers;
}

export async function verifyProvider(
  providerId: string,
  options: { model?: string; baseUrl?: string; apiKey?: string; path?: string } = {}
): Promise<ProviderVerificationResult> {
  const startTime = Date.now();

  // If in Electrobun webview with RPC, delegate to host process
  if (typeof window !== 'undefined' && (window as any).__postbirdRpc && (window as any).__postbirdRpc.verifyAiProvider) {
    try {
      return await (window as any).__postbirdRpc.verifyAiProvider({ providerId, ...options });
    } catch (e: any) {
      console.warn('[Discovery RPC Error, falling back to local verify]', e);
    }
  }

  // 1. Claude Code CLI
  if (providerId === 'claude') {
    const claudePath = options.path || findBinary('claude');
    if (!claudePath) {
      return { ok: false, message: 'claude binary not found in PATH' };
    }
    try {
      const authRes = cp.spawnSync(claudePath, ['auth', 'status'], { timeout: 3000, encoding: 'utf8' });
      const out = `${authRes.stdout || ''}\n${authRes.stderr || ''}`.trim();
      if (authRes.status !== 0 || out.includes('"loggedIn":false')) {
        return { ok: false, message: 'OAuth session expired or not logged in. Run "claude auth login".' };
      }
      return { ok: true, message: 'Claude Code CLI is authenticated and ready', latencyMs: Date.now() - startTime };
    } catch (err: any) {
      return { ok: false, message: `Failed to check claude: ${err.message}` };
    }
  }

  // 2. Antigravity CLI (agy)
  if (providerId === 'agy') {
    const agyPath = options.path || findBinary('agy');
    if (!agyPath) {
      return { ok: false, message: 'agy binary not found in PATH' };
    }
    let fetchedModels: string[] | undefined;
    try {
      const modelsRes = cp.spawnSync(agyPath, ['models'], { timeout: 20000, encoding: 'utf8' });
      if (modelsRes.status === 0 && modelsRes.stdout) {
        const lines = modelsRes.stdout.split('\n');
        const parsed: string[] = [];
        for (const line of lines) {
          const match = line.trim().match(/^([a-zA-Z0-9\.\-_]+)\s+/);
          if (match && !match[1].startsWith('Fetching') && !match[1].startsWith('Usage') && !match[1].startsWith('Available')) {
            parsed.push(match[1]);
          }
        }
        if (parsed.length > 0) {
          fetchedModels = parsed;
        }
      }
      return {
        ok: true,
        message: 'Antigravity CLI is ready',
        models: fetchedModels,
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return { ok: false, message: `Failed to check agy: ${err.message}` };
    }
  }

  // 3. Apple Foundation Models (fm)
  if (providerId === 'fm') {
    if (process.platform !== 'darwin') {
      return { ok: false, message: 'Apple Foundation Models are only supported on macOS' };
    }
    const fmPath = options.path || findBinary('fm');
    if (!fmPath) {
      return { ok: false, message: '/usr/bin/fm not found' };
    }
    try {
      const licRes = cp.spawnSync(fmPath, ['license', '--status'], { timeout: 2000, encoding: 'utf8' });
      if (licRes.status !== 0) {
        return { ok: false, message: "License not agreed. Run 'sudo fm license' to review and agree." };
      }
      const availRes = cp.spawnSync(fmPath, ['available'], { timeout: 2000, encoding: 'utf8' });
      if (availRes.status !== 0) {
        return { ok: false, message: 'System model unavailable (modelNotReady). Apple Intelligence assets required.' };
      }
      return { ok: true, message: 'Apple Foundation Model (~3B) is ready on-device', latencyMs: Date.now() - startTime };
    } catch (err: any) {
      return { ok: false, message: `Failed to check fm: ${err.message}` };
    }
  }

  // 4. Ollama Local Server
  if (providerId === 'ollama') {
    const url = options.baseUrl ? options.baseUrl.replace(/\/v1\/?$/, '') : 'http://127.0.0.1:11434';
    try {
      const data = await probeHttpEndpoint(`${url}/api/tags`, 2000);
      if (data && Array.isArray(data.models)) {
        const models = data.models.map((m: any) => m.name || m.model).filter(Boolean);
        return {
          ok: true,
          message: `Ollama is running (${models.length} local models available)`,
          models,
          latencyMs: Date.now() - startTime
        };
      }
      return { ok: false, message: 'Ollama is offline or unreachable. Run "ollama serve".' };
    } catch (err: any) {
      return { ok: false, message: `Ollama connection error: ${err.message}` };
    }
  }

  // 5. Generic CLI (gemini, cursor-agent, codex)
  if (['gemini', 'cursor-agent', 'codex'].includes(providerId)) {
    const bin = options.path || findBinary(providerId) || (providerId === 'cursor-agent' ? findBinary('agent') : null);
    if (!bin) {
      return { ok: false, message: `${providerId} binary not found in PATH` };
    }
    try {
      const res = cp.spawnSync(bin, ['--version'], { timeout: 2000, encoding: 'utf8' });
      if (res.status === 0 || (res.stdout && res.stdout.length > 0)) {
        return { ok: true, message: `${providerId} CLI is installed and executable`, latencyMs: Date.now() - startTime };
      }
    } catch (e) {}
    return { ok: true, message: `${providerId} CLI is present at ${bin}`, latencyMs: Date.now() - startTime };
  }

  // 6. Cloud & OpenAI-Compatible Endpoints
  const baseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/, '') : '';
  const apiKey = (options.apiKey || '').trim();

  if (!baseUrl) {
    return { ok: false, message: 'Base URL is required for custom endpoint.' };
  }

  if (!apiKey && providerId !== 'ollama' && !baseUrl.includes('127.0.0.1') && !baseUrl.includes('localhost')) {
    return { ok: false, message: 'API key is required. Please enter an API key.' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      if (baseUrl.includes('googleapis.com')) {
        headers['x-goog-api-key'] = apiKey;
      }
    }

    const modelsUrl = baseUrl.endsWith('/models') ? baseUrl : `${baseUrl}/models`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let modelsRes: Response | null = null;
    try {
      modelsRes = await fetch(modelsUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        return { ok: false, message: 'Connection timed out after 6 seconds.' };
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (modelsRes) {
      if (modelsRes.status === 200) {
        let models: string[] = [];
        try {
          const body: any = await modelsRes.json();
          if (body && Array.isArray(body.data)) {
            models = body.data.map((m: any) => m.id).filter(Boolean);
          } else if (body && Array.isArray(body.models)) {
            models = body.models.map((m: any) => m.name || m.id).filter(Boolean);
          }
        } catch (e) {}

        if (baseUrl.includes('generativelanguage.googleapis.com')) {
          models = models
            .map(m => m.replace(/^models\//, ''))
            .filter(m => m.includes('gemini') && !m.includes('embedding') && !m.includes('aqa'));
        }

        const latency = Date.now() - startTime;
        return {
          ok: true,
          message: `Connected successfully (${latency}ms) — API key verified`,
          models: models.length > 0 ? models : undefined,
          latencyMs: latency
        };
      }

      if (modelsRes.status === 401 || modelsRes.status === 403) {
        let errMsg = 'Authentication failed (401/403): Invalid API key';
        try {
          const errBody: any = await modelsRes.json();
          if (errBody?.error?.message) errMsg = errBody.error.message;
        } catch (e) {}
        return { ok: false, message: errMsg };
      }

      // If /models returned 404 or 400, fallback to a minimal chat completion ping
      if (modelsRes.status === 404 || modelsRes.status === 400) {
        const pingUrl = `${baseUrl}/chat/completions`;
        const pingModel = options.model || (baseUrl.includes('generativelanguage.googleapis.com') ? 'gemini-3.8-flash' : 'gpt-4o');
        const pingRes = await fetch(pingUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: pingModel,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 2
          })
        });

        if (pingRes.status === 200) {
          const latency = Date.now() - startTime;
          return { ok: true, message: `Connected successfully (${latency}ms) — API key verified`, latencyMs: latency };
        } else {
          let errText = `Endpoint returned HTTP ${pingRes.status}`;
          try {
            const errJson: any = await pingRes.json();
            if (errJson?.error?.message) errText = errJson.error.message;
          } catch (e) {}
          return { ok: false, message: errText };
        }
      }
    }

    return { ok: false, message: `Unexpected response status: ${modelsRes?.status}` };
  } catch (err: any) {
    return { ok: false, message: `Connection failed: ${err.message || String(err)}` };
  }
}
