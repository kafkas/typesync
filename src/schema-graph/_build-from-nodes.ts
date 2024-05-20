import { GenericAndLiteralNodesInSameLevelError, MultipleGenericNodesInSameLevelError } from '../errors/invalid-def.js';
import { assertDefined, assertNever } from '../util/assert.js';
import { extractGenericId } from '../util/misc.js';
import type { CollectionNode, DocumentNode } from './_nodes.js';
import { SchemaGraph, createSchemaGraph } from './impl.js';
import { CollectionChildrenJson, DocumentChildrenJson } from './json.js';

export function buildSchemaGraphFromNodes(rootNodes: CollectionNode[]): SchemaGraph {
  const representation = validateRepresentationTypeForLevel(rootNodes);
  if (representation === 'generic') {
    const [rootNode] = rootNodes;
    assertDefined(rootNode);
    return createSchemaGraph({
      root: {
        type: 'generic',
        collection: {
          type: 'generic',
          genericId: extractGenericId(rootNode.id),
          children: buildCollectionChildrenJson(rootNode.children),
        },
      },
    });
  } else if (representation === 'literal') {
    return createSchemaGraph({
      root: {
        type: 'literal',
        collections: rootNodes.map(rootNode => {
          return {
            type: 'literal',
            id: rootNode.id,
            children: buildCollectionChildrenJson(rootNode.children),
          };
        }),
      },
    });
  } else {
    assertNever(representation);
  }
}

function buildCollectionChildrenJson(childNodes: DocumentNode[]): CollectionChildrenJson {
  const representation = validateRepresentationTypeForLevel(childNodes);

  if (representation === 'generic') {
    const [childNode] = childNodes;
    assertDefined(childNode);
    return {
      type: 'generic',
      document: {
        type: 'generic-document',
        genericId: extractGenericId(childNode.id),
        children: buildDocumentChildrenJson(childNode.children),
      },
    };
  } else if (representation === 'literal') {
    return {
      type: 'literal',
      documents: childNodes.map(childNode => {
        return {
          type: 'literal-document',
          id: childNode.id,
          children: buildDocumentChildrenJson(childNode.children),
        };
      }),
    };
  } else {
    assertNever(representation);
  }
}

function buildDocumentChildrenJson(childNodes: CollectionNode[]): DocumentChildrenJson | null {
  if (childNodes.length === 0) return null;

  const representation = validateRepresentationTypeForLevel(childNodes);

  if (representation === 'generic') {
    const [childNode] = childNodes;
    assertDefined(childNode);
    return {
      type: 'generic',
      collection: {
        type: 'generic',
        genericId: extractGenericId(childNode.id),
        children: buildCollectionChildrenJson(childNode.children),
      },
    };
  } else if (representation === 'literal') {
    return {
      type: 'literal',
      collections: childNodes.map(childNode => {
        return {
          type: 'literal',
          id: childNode.id,
          children: buildCollectionChildrenJson(childNode.children),
        };
      }),
    };
  } else {
    assertNever(representation);
  }
}

function validateRepresentationTypeForLevel(levelNodes: (CollectionNode | DocumentNode)[]) {
  const [firstGenericNode, secondGenericNode] = levelNodes.filter(node => node.isGeneric);
  const [firstLiteralNode] = levelNodes.filter(node => !node.isGeneric);
  const hasGenericChild = firstGenericNode !== undefined;
  const hasLiteralChild = firstLiteralNode !== undefined;
  if (hasGenericChild) {
    if (hasLiteralChild) {
      throw new GenericAndLiteralNodesInSameLevelError(firstGenericNode.id, firstLiteralNode.id);
    }
    if (secondGenericNode !== undefined) {
      throw new MultipleGenericNodesInSameLevelError(firstGenericNode.id, secondGenericNode.id);
    }
    return 'generic';
  }
  if (hasLiteralChild) {
    return 'literal';
  }
  throw new Error('Representation type validation cannot be done for an empty list of nodes.');
}
