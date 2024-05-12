import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import type { GraphGeneration, GraphGenerator, GraphGeneratorConfig } from './_types.js';
import { MermaidGraph, MermaidGraphLink, MermaidGraphOrientation } from './_types.js';
import type { Collection, SchemaGraph } from './schema-graph.js';

type SchemaGraphOrientation = 'vertical' | 'horizontal';

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

  private buildSchemaGraphFromSchema(_s: schema.Schema) {
    // TODO: Implement
    const graph: SchemaGraph = { rootCollections: [] };
    return graph;
  }

  public buildMermaidGraph(graph: SchemaGraph): MermaidGraph {
    const links: MermaidGraphLink[] = [];
    graph.rootCollections.forEach(rootCollection => {
      links.push(...this.buildLinks(rootCollection));
    });
    return {
      orientation: this.getMermaidOrientation(this.config.orientation),
      links,
    };
  }

  private buildLinks(collection: Collection): MermaidGraphLink[] {
    const links: MermaidGraphLink[] = [];
    collection.documents.forEach(document => {
      if (document.type === 'generic-document') {
        const documentNodeId = `generic_${document.genericId}[${document.genericId}]`;
        links.push([collection.id, documentNodeId]);
        document.subCollections.forEach(subCollection => {
          links.push([documentNodeId, subCollection.id]);
        });
      } else if (document.type === 'literal-document') {
        // TODO: Implement
        throw new Error('Unimplemented');
      } else {
        assertNever(document);
      }
    });
    return links;
  }

  private getMermaidOrientation(orientation: SchemaGraphOrientation): MermaidGraphOrientation {
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
