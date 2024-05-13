export interface SchemaGraph {
  children: GraphChildren;
}

interface GenericGraphChildren {
  type: 'generic-graph-children';
  collection: GenericRootCollection;
}

interface LiteralGraphChildren {
  type: 'literal-graph-children';
  collections: LiteralRootCollection[];
}

type GraphChildren = GenericGraphChildren | LiteralGraphChildren;

export interface GenericRootCollection {
  type: 'generic-root-collection';
  genericId: string;
  path: string;
  children: CollectionChildren;
}

export interface LiteralRootCollection {
  type: 'literal-root-collection';
  id: string;
  path: string;
  children: CollectionChildren;
}

export interface GenericSubCollection {
  type: 'generic-sub-collection';
  genericId: string;
  parent: Document;
  path: string;
  children: CollectionChildren;
}

export interface LiteralSubCollection {
  type: 'literal-sub-collection';
  id: string;
  parent: Document;
  path: string;
  children: CollectionChildren;
}

export type RootCollection = GenericRootCollection | LiteralRootCollection;
export type SubCollection = GenericSubCollection | LiteralSubCollection;
export type Collection = RootCollection | SubCollection;

export interface GenericCollectionChildren {
  type: 'generic-collection-children';
  document: GenericDocument;
}

export interface LiteralCollectionChildren {
  type: 'literal-collection-children';
  documents: LiteralDocument[];
}

export type CollectionChildren = GenericCollectionChildren | LiteralCollectionChildren;

export interface GenericDocument {
  type: 'generic-document';
  genericId: string;
  parent: Collection;
  path: string;
  children: DocumentChildren | null;
}

export interface LiteralDocument {
  type: 'literal-document';
  id: string;
  parent: Collection;
  path: string;
  children: DocumentChildren | null;
}

export type Document = GenericDocument | LiteralDocument;

interface GenericDocumentChildren {
  type: 'generic-document-children';
  collection: GenericSubCollection;
}

interface LiteralDocumentChildren {
  type: 'literal-document-children';
  collections: LiteralSubCollection[];
}

type DocumentChildren = GenericDocumentChildren | LiteralDocumentChildren;
