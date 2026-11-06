export type AIProviderId =
  | 'fm'
  | 'agy'
  | 'claude'
  | 'cursor-agent'
  | 'gemini'
  | 'codex'
  | 'foundry'
  | 'ollama'
  | 'openai'
  | 'anthropic'
  | 'custom';

export type ProviderStatus = 'ready' | 'needs_setup' | 'offline' | 'not_found';

export interface DiscoveredProvider {
  id: AIProviderId | string;
  name: string;
  status: ProviderStatus;
  path?: string;
  models: string[];
  defaultModel?: string;
  hint?: string;
  commandHint?: string;
  source: 'macos-builtin' | 'windows-native' | 'local-cli' | 'local-http' | 'cloud' | 'custom';
  baseUrl?: string;
  apiKey?: string;
}

export interface ProviderVerificationResult {
  ok: boolean;
  message: string;
  models?: string[];
  latencyMs?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  provider?: string;
  prompt: string;
  system?: string;
  messages?: ChatMessage[];
  model?: string;
  stream?: boolean;
  jsonSchema?: Record<string, any>;
  onToken?: (delta: string) => void;
  signal?: AbortSignal;
}

export interface CustomEndpointConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
  headers?: Record<string, string>;
}

export interface AIConnectorConfig {
  defaultProvider?: string;
  defaultModel?: string;
  preferredProvider?: string;
  preferredModel?: string;
  customEndpoint?: CustomEndpointConfig;
  customEndpoints?: CustomEndpointConfig[];
  priorityOrder?: string[];
}
