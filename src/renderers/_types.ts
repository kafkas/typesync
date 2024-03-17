import type { PythonGenerationPlatform, TSGenerationPlatform } from '../api';
import type { generation } from '../generation';

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

export interface PythonRendererConfig {
  rootFileName: string;
  platform: PythonGenerationPlatform;
}

export interface TSRendererConfig {
  rootFileName: string;
  platform: TSGenerationPlatform;
}

export type RendererConfig = PythonRendererConfig | TSRendererConfig;

export interface PythonRenderer {
  type: 'python';
  render(g: generation.PythonGeneration): RenderedFile[];
}

export interface TSRenderer {
  type: 'ts';
  render(g: generation.TSGeneration): RenderedFile[];
}

export type Renderer = PythonRenderer | TSRenderer;
