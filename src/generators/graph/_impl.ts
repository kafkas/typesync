import { Collection, Document, type SchemaGraph } from '../../schema-graph/index.js';
import { assertNever } from '../../util/assert.js';
import type { GraphGeneration, GraphGenerator, GraphGeneratorConfig } from './_types.js';
import { MermaidGraph, MermaidGraphNode, MermaidGraphOrientation } from './mermaid-graph.js';

type SchemaGraphOrientation = 'vertical' | 'horizontal';

export class GraphGeneratorImpl implements GraphGenerator {
  public constructor(private readonly config: GraphGeneratorConfig) {}

  public generate(graph: SchemaGraph): GraphGeneration {
    const mermaidGraph = this.buildMermaidGraphFromSchemaGraph(graph);
    return {
      type: 'graph',
      graph: mermaidGraph,
    };
  }

  public buildMermaidGraphFromSchemaGraph(graph: SchemaGraph): MermaidGraph {
    const mermaidGraphOrientation = this.getMermaidGraphOrientation(this.config.orientation);
    const mermaidGraph = new MermaidGraph(mermaidGraphOrientation);
    if (graph.root.type === 'generic') {
      this.buildNodeForCollection(mermaidGraph, graph.root.collection);
    } else if (graph.root.type === 'literal') {
      graph.root.collections.forEach(col => {
        this.buildNodeForCollection(mermaidGraph, col);
      });
    } else {
      assertNever(graph.root);
    }
    return mermaidGraph;
  }

  private buildNodeForCollection(mermaidGraph: MermaidGraph, col: Collection): MermaidGraphNode {
    const colNode = mermaidGraph.createNode(col.id);
    if (col.children.type === 'generic') {
      const docNode = this.buildNodeForDocument(mermaidGraph, col.children.document);
      mermaidGraph.link(colNode, docNode);
    } else if (col.children.type === 'literal') {
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
      if (doc.children.type === 'generic') {
        const colNode = this.buildNodeForCollection(mermaidGraph, doc.children.collection);
        mermaidGraph.link(docNode, colNode);
      } else if (doc.children.type === 'literal') {
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
