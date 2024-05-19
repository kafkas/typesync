import { schema } from '../schema/index.js';
import { assertDefined } from '../util/assert.js';
import { buildSchemaGraphFromNodes } from './_build-from-nodes.js';
import { CollectionNode, DocumentNode } from './_nodes.js';
import { SchemaGraph } from './impl.js';

export function createSchemaGraphFromSchema(s: schema.Schema): SchemaGraph {
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

  return buildSchemaGraphFromNodes(rootNodes);
}
