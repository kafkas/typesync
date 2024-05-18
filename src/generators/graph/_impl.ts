import { type schema } from '../../schema/index.js';
import { assert, assertDefined, assertNever } from '../../util/assert.js';
import { extractGenericId } from '../../util/misc.js';
import type { GraphGeneration, GraphGenerator, GraphGeneratorConfig } from './_types.js';
import { MermaidGraph, MermaidGraphNode, MermaidGraphOrientation } from './mermaid-graph.js';
import { Collection, CollectionNode, Document, DocumentNode, SchemaGraph } from './schema-graph/index.js';

type SchemaGraphOrientation = 'vertical' | 'horizontal';

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

  public buildSchemaGraphFromSchema(s: schema.Schema): SchemaGraph {
    const { documentModels } = s;
    const rootNodesById = new Map<string, CollectionNode>();
    const collectionNodesByPath = new Map<string, CollectionNode>();
    const documentNodesByPath = new Map<string, DocumentNode>();

    documentModels.forEach(model => {
      // TODO: Validate path
      const parts = model.path.split('/');

      parts.forEach((id, idx) => {
        const path = parts.slice(0, idx + 1).join('/');
        if (idx % 2 === 0) {
          // Collection
          let node = collectionNodesByPath.get(path);
          if (!node) {
            node = new CollectionNode(id);
            collectionNodesByPath.set(path, node);
          }
          if (idx === 0) {
            rootNodesById.set(id, node);
          }
        } else {
          // Document
          let node = documentNodesByPath.get(path);
          if (!node) {
            node = new DocumentNode(id);
            documentNodesByPath.set(path, node);
          }
        }
      });

      // Link nodes
      parts.forEach((id, idx) => {
        if (idx === 0) return;
        const parentPath = parts.slice(0, idx).join('/');
        const path = [parentPath, id].join('/');
        if (idx % 2 === 0) {
          const node = collectionNodesByPath.get(path);
          const parentNode = documentNodesByPath.get(parentPath);
          assertDefined(node, `Expected node to be defined for path '${path}'.`);
          assertDefined(parentNode, `Expected parent node to be defined for path '${parentPath}'.`);
          if (!parentNode.hasChild(node.id)) {
            parentNode.addChild(node);
          }
        } else {
          const node = documentNodesByPath.get(path);
          const parentNode = collectionNodesByPath.get(parentPath);
          assertDefined(node, `Expected node to be defined for path '${path}'.`);
          assertDefined(parentNode, `Expected parent node to be defined for path '${parentPath}'.`);
          if (!parentNode.hasChild(node.id)) {
            parentNode.addChild(node);
          }
        }
      });
    });

    const rootNodes = Array.from(rootNodesById.values());
    const hasGenericRootNode = rootNodes.some(node => node.isGeneric);
    const hasLiteralRootNode = rootNodes.some(node => !node.isGeneric);

    if (hasGenericRootNode) {
      assert(!hasLiteralRootNode, `todo`);
      assert(rootNodesById.size === 1, `todo`);
    } else if (hasLiteralRootNode) {
      assert(!hasGenericRootNode, `todo`);
    }

    if (hasGenericRootNode) {
      const [rootNode] = rootNodes;
      assertDefined(rootNode);
      const genericId = extractGenericId(rootNode.id);

      // TODO: Implement
      throw new Error('Unimplemented');
    } else {
      throw new Error('Unimplemented');
    }
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
