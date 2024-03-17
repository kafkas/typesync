import type { generation } from '../generation';

interface File {
  /**
   * The relative path to the file.
   */
  relativePath: string;

  /**
   * Content as string.
   */
  content: string;
}

export interface PythonRenderer {
  type: 'python';
  render(g: generation.PythonGeneration): File[];
}

export interface TSRenderer {
  type: 'ts';
  render(g: generation.TSGeneration): File[];
}

export type Generation = PythonRenderer | TSRenderer;
