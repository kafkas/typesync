import type { PythonGenerationPlatform } from '../../api';
import type { PythonGeneration } from '../../generators/python';
import type { RenderedFile } from '../_types';

export interface PythonRendererConfig {
  rootFileName: string;
  platform: PythonGenerationPlatform;
  indentation: number;
}

export interface PythonRenderer {
  render(g: PythonGeneration): Promise<RenderedFile[]>;
}
