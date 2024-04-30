import type { RulesGenerationPlatform } from '../../api.js';
import type { RulesGeneration } from '../../generators/rules/index.js';
import type { RenderedFile } from '../_types.js';

export interface RulesRendererConfig {
  platform: RulesGenerationPlatform;
  indentation: number;
}

export interface RulesRenderer {
  render(g: RulesGeneration): Promise<RenderedFile>;
}
