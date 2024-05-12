import type { schema } from '../../schema/index.js';

export type MermaidGraphOrientation = 'TB' | 'LR';

export type MermaidGraphLink = [nodeId: string, nodeId: string];

export interface MermaidGraph {
  orientation: MermaidGraphOrientation;
  links: MermaidGraphLink[];
}

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
