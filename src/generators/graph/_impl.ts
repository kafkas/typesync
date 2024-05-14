import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import type { GraphGeneration, GraphGenerator, GraphGeneratorConfig } from './_types.js';
import { MermaidGraph, MermaidGraphLink, MermaidGraphOrientation } from './_types.js';
import {
  createLiteralRootCollectionWithGenericChildren,
  createLiteralSubCollectionWithGenericChildren,
} from './factory.js';
import { SchemaGraphImpl } from './schema-graph/impl.js';
import { Collection, SchemaGraph } from './schema-graph/interfaces.js';

type SchemaGraphOrientation = 'vertical' | 'horizontal';

function isGeneric(part: string) {
  return part.startsWith('{') && part.endsWith('}');
}

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

  public buildSchemaGraphFromSchema(s: schema.Schema): SchemaGraph {
    const { documentModels } = s;

    // TODO: Mapping from path -> nodes

    documentModels.forEach(documentModel => {
      // TODO: Validate path structure
      const parts = documentModel.path.split('/');

      for (let i = 0; i < parts.length; i += 2) {
        const collectionId = parts[i]!;
        const documentId = parts[i + 1]!;

        if (isGeneric(collectionId)) {
          // Generic
          const genericId = collectionId.slice(1, collectionId.length - 1);
          throw new Error('Unimplemented');
        } else {
          // Literal
          if (i === 0) {
            // Root collection
            if (isGeneric(documentId)) {
              createLiteralRootCollectionWithGenericChildren(collectionId, documentId);
            } else {
              throw new Error('Unimplemented');
            }
          } else {
            // Sub-collection
            if (isGeneric(documentId)) {
              //
            } else {
              // createLiteralSubCollectionWithGenericChildren(parentDocument, id);
            }
          }
        }
      }

      parts.forEach((part, partIdx) => {
        // Generic
        // if (partIdx % 2 === 0) {
        //   throw new Error(`Generic IDs are not allowed for collections`);
        // }
      });
    });

    return { children: { type: 'literal-graph-children', collections: [] } };
  }

  public buildMermaidGraph(graph: SchemaGraph): MermaidGraph {
    const links: MermaidGraphLink[] = [];

    if (graph.children.type === 'generic-graph-children') {
      // TODO: Handle
      throw new Error('Unimplemented');
    } else if (graph.children.type === 'literal-graph-children') {
      graph.children.collections.forEach(rootCollection => {
        links.push(...this.buildLinks(rootCollection));
      });
    } else {
      assertNever(graph.children);
    }

    return {
      orientation: this.getMermaidOrientation(this.config.orientation),
      links,
    };
  }

  private buildLinks(collection: Collection): MermaidGraphLink[] {
    const links: MermaidGraphLink[] = [];

    if (collection.children.type === 'generic-collection-children') {
      const doc = collection.children.document;
      const documentNodeId = `generic_${doc.genericId}[${doc.genericId}]`;
      links.push([collection.id, documentNodeId]);
      if (doc.children !== null) {
        if (doc.children.type === 'generic-document-children') {
          const subCollection = doc.children.collection;
          // TODO: Use a unique generic ID
          links.push([documentNodeId, subCollection.id]);
        } else if (doc.children.type === 'literal-document-children') {
          doc.children.collections.forEach(subCollection => {
            links.push([documentNodeId, subCollection.id]);
          });
        } else {
          assertNever(doc.children);
        }
      }
    } else if (collection.children.type === 'literal-collection-children') {
      collection.children.documents.forEach(doc => {
        const documentNodeId = `literal_${doc.id}[${doc.id}]`;
        links.push([collection.id, documentNodeId]);
      });
    } else {
      assertNever(collection.children);
    }

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
