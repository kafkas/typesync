import type { PythonGenerationPlatform, TSGenerationPlatform } from '../api';
import type { Generation } from '../generators';
import type { PythonGeneration } from '../generators/python';
import type { TSGeneration } from '../generators/ts';

export interface PythonRendererConfig {
  rootFileName: string;
  platform: PythonGenerationPlatform;
  indentation: number;
}

export interface TSRendererConfig {
  rootFileName: string;
  platform: TSGenerationPlatform;
}

export type RendererConfig = PythonRendererConfig | TSRendererConfig;

export interface PythonRenderer {
  render(g: PythonGeneration): RenderedFile[];
}

export interface TSRenderer {
  render(g: TSGeneration): RenderedFile[];
}

export interface RenderedFile {
  /**
   * The relative path to the file.
   */
  relativePath: string;

  /**
   * Content as string.
   */
  content: string;
}

export interface Renderer {
  render(g: Generation): RenderedFile[];
}
