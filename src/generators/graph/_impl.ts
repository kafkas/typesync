import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import type { GraphGeneration, GraphGenerator, GraphGeneratorConfig } from './_types.js';
import { MermaidGraph, MermaidGraphNode, MermaidGraphOrientation } from './mermaid-graph.js';
import { Collection, Document, SchemaGraph } from './schema-graph/interfaces.js';

type SchemaGraphOrientation = 'vertical' | 'horizontal';

// function isGeneric(part: string) {
//   return part.startsWith('{') && part.endsWith('}');
// }

export class GraphGeneratorImpl implements GraphGenerator {
  public constructor(private readonly config: GraphGeneratorConfig) {}

  public generate(s: schema.Schema): GraphGeneration {
    const { documentModels: _ } = s;
    const schemaGraph = this.buildSchemaGraphFromSchema(s);
    const mermaidGraph = this.buildMermaidGraphFromSchemaGraph(schemaGraph);
    return {
      type: 'graph',
      graph: mermaidGraph,
    };
  }

  public buildSchemaGraphFromSchema(_s: schema.Schema): SchemaGraph {
    // TODO: Implement
    return { children: { type: 'literal-graph-children', collections: [] } };
  }

  public buildMermaidGraphFromSchemaGraph(graph: SchemaGraph): MermaidGraph {
    const mermaidGraphOrientation = this.getMermaidGraphOrientation(this.config.orientation);
    const mermaidGraph = new MermaidGraph(mermaidGraphOrientation);
    if (graph.children.type === 'generic-graph-children') {
      this.buildNodeForCollection(mermaidGraph, graph.children.collection);
    } else if (graph.children.type === 'literal-graph-children') {
      graph.children.collections.forEach(col => {
        this.buildNodeForCollection(mermaidGraph, col);
      });
    } else {
      assertNever(graph.children);
    }
    return mermaidGraph;
  }

  private buildNodeForCollection(mermaidGraph: MermaidGraph, col: Collection): MermaidGraphNode {
    const colNode = mermaidGraph.createNode(col.id);
    if (col.children.type === 'generic-collection-children') {
      const docNode = this.buildNodeForDocument(mermaidGraph, col.children.document);
      mermaidGraph.link(colNode, docNode);
    } else if (col.children.type === 'literal-collection-children') {
      col.children.documents.forEach(doc => {
        const docNode = this.buildNodeForDocument(mermaidGraph, doc);
        mermaidGraph.link(colNode, docNode);
      });
    } else {
      assertNever(col.children);
    }
    return colNode;
  }

  private buildNodeForDocument(mermaidGraph: MermaidGraph, doc: Document): MermaidGraphNode {
    const docNode = mermaidGraph.createNode(doc.id);
    if (doc.children !== null) {
      if (doc.children.type === 'generic-document-children') {
        const colNode = this.buildNodeForCollection(mermaidGraph, doc.children.collection);
        mermaidGraph.link(docNode, colNode);
      } else if (doc.children.type === 'literal-document-children') {
        doc.children.collections.forEach(col => {
          const colNode = this.buildNodeForCollection(mermaidGraph, col);
          mermaidGraph.link(docNode, colNode);
        });
      } else {
        assertNever(doc.children);
      }
    }
    return docNode;
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
