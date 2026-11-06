import { CompletionOptions } from '../types';

export interface BaseAdapter {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  generate(options: CompletionOptions): Promise<string>;
  stream(options: CompletionOptions): AsyncIterable<string>;
}
