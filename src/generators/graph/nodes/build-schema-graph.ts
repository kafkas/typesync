import { assert, assertDefined, assertNever } from '../../../util/assert.js';
import { extractGenericId } from '../../../util/misc.js';
import { SchemaGraph, createSchemaGraph } from '../schema-graph/impl.js';
import { CollectionChildrenJson, DocumentChildrenJson } from '../schema-graph/json.js';
import { type CollectionNode, DocumentNode } from './nodes.js';

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

function validateRepresentationTypeForLevel(levelNodes: (CollectionNode | DocumentNode)[]) {
  const hasGenericChild = levelNodes.some(node => node.isGeneric);
  const hasLiteralChild = levelNodes.some(node => !node.isGeneric);
  const assertion = 'Generic nodes and literal nodes cannot be siblings.';
  if (hasGenericChild) {
    assert(!hasLiteralChild, assertion);
    assert(levelNodes.length === 1, 'There can be only one generic node that represents a level.');
    return 'generic';
  }
  if (hasLiteralChild) {
    assert(!hasGenericChild, assertion);
    return 'literal';
  }
  throw new Error(assertion);
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
