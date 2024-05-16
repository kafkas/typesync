import type { GraphGeneration } from '../../generators/graph/index.js';
import type { RenderedFile } from '../_types.js';
import { MermaidGraph2 } from './mermaid-graph2.js';

export interface GraphRendererConfig {
  pathToOutputFile: string;
  startMarker: string;
  endMarker: string;
}

export interface GraphRenderer {
  render(g: GraphGeneration): Promise<RenderedFile>;
  render2(graph: MermaidGraph2): Promise<RenderedFile>;
}
