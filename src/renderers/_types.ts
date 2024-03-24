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

export interface Renderer {
  render(g: Generation): Promise<RenderedFile[]>;
}
