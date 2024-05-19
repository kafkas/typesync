import { SchemaGraphOrientation } from '../../api/index.js';
import { type SchemaGraph } from '../../schema-graph/index.js';
import { MermaidGraph } from './mermaid-graph.js';

export interface GraphGeneration {
  type: 'graph';
  graph: MermaidGraph;
}

export interface GraphGeneratorConfig {
  orientation: SchemaGraphOrientation;
}

export interface GraphGenerator {
  generate(graph: SchemaGraph): GraphGeneration;
}
