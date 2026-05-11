import type { TSGenerationTarget, ZodVariant } from '../../api/index.js';
import type { ZodGeneration } from '../../generators/zod/index.js';
import type { RenderedFile } from '../_types.js';

export interface ZodRendererConfig {
  target: TSGenerationTarget;
  variant: ZodVariant;
  indentation: number;
}

export interface ZodRenderer {
  render(g: ZodGeneration): Promise<RenderedFile>;
}
