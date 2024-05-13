export interface GenericRootCollection {
  type: 'generic-root-collection';
  genericId: string;
  children: CollectionChildren;
}

export interface LiteralRootCollection {
  type: 'literal-root-collection';
  id: string;
  children: CollectionChildren;
}

export interface GenericSubCollection {
  type: 'generic-sub-collection';
  parent: Document;
  genericId: string;
  children: CollectionChildren;
}

export interface LiteralSubCollection {
  type: 'literal-sub-collection';
  parent: Document;
  id: string;
  children: CollectionChildren;
}

export type RootCollection = GenericRootCollection | LiteralRootCollection;
export type SubCollection = GenericSubCollection | LiteralSubCollection;
export type Collection = RootCollection | SubCollection;

interface GenericCollectionChildren {
  type: 'generic-collection-children';
  document: GenericDocument;
}

interface LiteralCollectionChildren {
  type: 'literal-collection-children';
  documents: LiteralDocument[];
}

type CollectionChildren = GenericCollectionChildren | LiteralCollectionChildren;

export interface GenericDocument {
  type: 'generic-document';
  genericId: string;
  parent: Collection;
  children: DocumentChildren | null;
}

export interface LiteralDocument {
  type: 'literal-document';
  id: string;
  parent: Collection;
  children: DocumentChildren | null;
}

interface GenericDocumentChildren {
  type: 'generic-document-children';
  collection: GenericSubCollection;
}

interface LiteralDocumentChildren {
  type: 'literal-document-children';
  collections: LiteralSubCollection[];
}

type DocumentChildren = GenericDocumentChildren | LiteralDocumentChildren;

export interface DatabaseGraph {
  rootCollections: RootCollection[];
}
