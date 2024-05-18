import type { schema } from '../../schema/index.js';
import { MermaidGraph } from './mermaid-graph.js';

export interface GraphGeneration {
  type: 'graph';
  graph: MermaidGraph;
}

export type SchemaGraphOrientation = 'vertical' | 'horizontal';

export interface GraphGeneratorConfig {
  orientation: SchemaGraphOrientation;
}

export interface GraphGenerator {
  generate(s: schema.Schema): GraphGeneration;
}
