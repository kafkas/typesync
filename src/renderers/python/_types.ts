import type { PythonGenerationPlatform } from '../../api.js';
import type { PythonGeneration } from '../../generators/python/index.js';
import type { RenderedFile } from '../_types.js';

export interface CustomPydanticBase {
  /** @example "x.y" */
  importPath: string;
  /** @example "CustomClass" */
  className: string;
}

export interface PythonRendererConfig {
  platform: PythonGenerationPlatform;
  indentation: number;
  customPydanticBase?: CustomPydanticBase;
}

export interface PythonRenderer {
  render(g: PythonGeneration): Promise<RenderedFile>;
}
