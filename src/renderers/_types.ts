import type { Generation } from '../generators/index.js';

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

export interface RenderResult {
  rootFile: RenderedFile;
  files: RenderedFile[];
}

export interface Renderer {
  render(g: Generation): Promise<RenderResult>;
}
