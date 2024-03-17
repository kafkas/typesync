import type { PythonGenerationPlatform, TSGenerationPlatform } from '../api';
import type { generation } from '../generation';

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
  render(g: generation.PythonGeneration): RenderedFile[];
}

export interface TSRenderer {
  render(g: generation.TSGeneration): RenderedFile[];
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
  render(g: generation.Generation): RenderedFile[];
}
