import type { TSGenerationPlatform } from '../../api.js';
import type { TSGeneration } from '../../generators/ts/index.js';
import type { RenderResult } from '../_types.js';

export interface TSRendererConfig {
  rootFileName: string;
  platform: TSGenerationPlatform;
  indentation: number;
}

export interface TSRenderer {
  render(g: TSGeneration): Promise<RenderResult>;
}
