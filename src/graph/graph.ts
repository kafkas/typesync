import { assertNever } from '../util/assert.js';
import type { Collection, RootCollection } from './nodes.js';
import { MermaidGraph, MermaidGraphLink, MermaidGraphOrientation } from './types.js';

type SchemaGraphOrientation = 'vertical' | 'horizontal';

export function buildMermaidGraph(
  orientation: SchemaGraphOrientation,
  rootCollections: RootCollection[]
): MermaidGraph {
  const links: MermaidGraphLink[] = [];
  rootCollections.forEach(rootCollection => {
    links.push(...buildLinks(rootCollection));
  });
  return { orientation: getMermaidOrientation(orientation), links };
}

function buildLinks(collection: Collection): MermaidGraphLink[] {
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

function getMermaidOrientation(orientation: SchemaGraphOrientation): MermaidGraphOrientation {
  switch (orientation) {
    case 'vertical':
      return 'TB';
    case 'horizontal':
      return 'LR';
    default:
      assertNever(orientation);
  }
}
