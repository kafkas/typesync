import type { GraphGeneration } from '../../generators/graph/index.js';
import type { RenderedFile } from '../_types.js';

export interface GraphRendererConfig {
  pathToOutputFile: string;
  startMarker: string;
  endMarker: string;
}

export interface GraphRenderer {
  render(g: GraphGeneration): Promise<RenderedFile>;
}
