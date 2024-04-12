import type { PythonGenerationPlatform } from '../../api.js';
import type { PythonGeneration } from '../../generators/python/index.js';
import type { RenderedFile } from '../_types.js';

export interface PythonRendererConfig {
  platform: PythonGenerationPlatform;
  indentation: number;
}

export interface PythonRenderer {
  render(g: PythonGeneration): Promise<RenderedFile>;
}
