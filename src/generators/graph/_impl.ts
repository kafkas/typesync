import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import type { GraphGeneration, GraphGenerator, GraphGeneratorConfig } from './_types.js';
import { MermaidGraph, MermaidGraphOrientation } from './mermaid-graph.js';
import { SchemaGraph } from './schema-graph/interfaces.js';

type SchemaGraphOrientation = 'vertical' | 'horizontal';

// function isGeneric(part: string) {
//   return part.startsWith('{') && part.endsWith('}');
// }

export class GraphGeneratorImpl implements GraphGenerator {
  public constructor(private readonly config: GraphGeneratorConfig) {}

  public generate(s: schema.Schema): GraphGeneration {
    const { documentModels: _ } = s;
    const schemaGraph = this.buildSchemaGraphFromSchema(s);
    const mermaidGraph = this.buildMermaidGraph(schemaGraph);
    return {
      type: 'graph',
      graph: mermaidGraph,
    };
  }

  public buildSchemaGraphFromSchema(_s: schema.Schema): SchemaGraph {
    // TODO: Implement
    return { children: { type: 'literal-graph-children', collections: [] } };
  }

  public buildMermaidGraph(_graph: SchemaGraph): MermaidGraph {
    // TODO: Implement
    return new MermaidGraph('LR');
  }

  private getMermaidGraphOrientation(orientation: SchemaGraphOrientation): MermaidGraphOrientation {
    switch (orientation) {
      case 'vertical':
        return 'TB';
      case 'horizontal':
        return 'LR';
      default:
        assertNever(orientation);
    }
  }
}

export function createGraphGenerator(config: GraphGeneratorConfig): GraphGenerator {
  return new GraphGeneratorImpl(config);
}
