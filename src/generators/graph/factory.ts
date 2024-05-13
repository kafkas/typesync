import {
  DocumentImpl,
  GenericDocumentImpl,
  GenericRootCollectionImpl,
  LiteralRootCollectionImpl,
  LiteralSubCollectionImpl,
} from './graph-impl.js';

export function createLiteralRootCollectionWithGenericChildren(rootCollectionId: string, genericDocumentId: string) {
  const placeholderCol = new GenericRootCollectionImpl('placeholder', {
    type: 'literal-collection-children',
    documents: [],
  });
  const document = new GenericDocumentImpl(genericDocumentId, placeholderCol, null);
  const collection = new LiteralRootCollectionImpl(rootCollectionId, {
    type: 'generic-collection-children',
    document,
  });
  document.setParent(collection);
  return { collection, document };
}

export function createLiteralSubCollectionWithGenericChildren(
  parentDocument: DocumentImpl,
  subCollectionId: string,
  genericDocumentId: string
) {
  const placeholderCol = new GenericRootCollectionImpl('placeholder', {
    type: 'literal-collection-children',
    documents: [],
  });
  const document = new GenericDocumentImpl(genericDocumentId, placeholderCol, null);
  const collection = new LiteralSubCollectionImpl(subCollectionId, parentDocument, {
    type: 'generic-collection-children',
    document,
  });
  document.setParent(collection);
  parentDocument.addLiteralSubCollection(collection);

  return { collection, document };
}
