import { AIRouter } from './router';
import { AIConnectorConfig } from './types';

export * from './types';
export * from './discovery';
export * from './router';
export * from './adapters/base';
export * from './adapters/fm';
export * from './adapters/agy';
export * from './adapters/claude';
export * from './adapters/openai_compatible';
export * from './logger';
export * from './usage_tracker';

export function createAIConnector(config: AIConnectorConfig = {}) {
  return new AIRouter(config);
}
