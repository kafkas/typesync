import type { Generation } from '../generators/index.js';

export interface RenderedFile {
  /**
   * Content as string.
   */
  content: string;
}

export interface Renderer {
  render(g: Generation): Promise<RenderedFile>;
}
