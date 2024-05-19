import { schema } from '../schema/index.js';
import { assertDefined, assertNever } from '../util/assert.js';
import { buildSchemaGraphFromNodes } from './_build-from-nodes.js';
import { extractModelPathSegments } from './_extract-model-path-segments.js';
import { CollectionNode, DocumentNode } from './_nodes.js';
import { SchemaGraph } from './impl.js';

export function createSchemaGraphFromSchema(s: schema.Schema): SchemaGraph {
  const { documentModels } = s;
  const rootNodesById = new Map<string, CollectionNode>();
  const collectionNodesByPath = new Map<string, CollectionNode>();
  const documentNodesByPath = new Map<string, DocumentNode>();

  documentModels.forEach(model => {
    const segments = extractModelPathSegments(model.name, model.path);

    segments.forEach(segment => {
      const { id, path, type, level } = segment;
      if (type === 'collection') {
        let node = collectionNodesByPath.get(path);
        if (!node) {
          node = new CollectionNode(id);
          collectionNodesByPath.set(path, node);
        }
        if (level === 0) {
          rootNodesById.set(id, node);
        }
      } else if (type === 'document') {
        let node = documentNodesByPath.get(path);
        if (!node) {
          node = new DocumentNode(id);
          documentNodesByPath.set(path, node);
        }
      } else {
        assertNever(type);
      }
    });

    // Link nodes
    segments.forEach(segment => {
      const { type, path, parentPath } = segment;
      if (parentPath === null) return;
      if (type === 'collection') {
        const node = collectionNodesByPath.get(path);
        const parentNode = documentNodesByPath.get(parentPath);
        assertDefined(node, `Expected node to be defined for path '${path}'.`);
        assertDefined(parentNode, `Expected parent node to be defined for path '${parentPath}'.`);
        if (!parentNode.hasChild(node.id)) {
          parentNode.addChild(node);
        }
      } else if (type === 'document') {
        const node = documentNodesByPath.get(path);
        const parentNode = collectionNodesByPath.get(parentPath);
        assertDefined(node, `Expected node to be defined for path '${path}'.`);
        assertDefined(parentNode, `Expected parent node to be defined for path '${parentPath}'.`);
        if (!parentNode.hasChild(node.id)) {
          parentNode.addChild(node);
        }
      } else {
        assertNever(type);
      }
    });
  });

  const rootNodes = Array.from(rootNodesById.values());

  return buildSchemaGraphFromNodes(rootNodes);
}
