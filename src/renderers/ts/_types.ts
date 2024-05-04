import type { TSGenerationTarget } from '../../api/index.js';
import type { TSGeneration } from '../../generators/ts/index.js';
import type { RenderedFile } from '../_types.js';

export interface TSRendererConfig {
  target: TSGenerationTarget;
  indentation: number;
}

export interface TSRenderer {
  render(g: TSGeneration): Promise<RenderedFile>;
}
