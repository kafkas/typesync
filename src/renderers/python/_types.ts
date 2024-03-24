import type { PythonGenerationPlatform } from '../../api.js';
import type { PythonGeneration } from '../../generators/python/index.js';
import type { RenderResult } from '../_types.js';

export interface PythonRendererConfig {
  rootFileName: string;
  platform: PythonGenerationPlatform;
  indentation: number;
}

export interface PythonRenderer {
  render(g: PythonGeneration): Promise<RenderResult>;
}
