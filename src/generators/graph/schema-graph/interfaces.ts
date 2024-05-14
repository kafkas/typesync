export interface SchemaGraph {
  children: GraphChildren;
}

export interface GenericGraphChildren {
  type: 'generic-graph-children';
  collection: GenericRootCollection;
}

export interface LiteralGraphChildren {
  type: 'literal-graph-children';
  collections: LiteralRootCollection[];
}

export type GraphChildren = GenericGraphChildren | LiteralGraphChildren;

export interface GenericRootCollection {
  type: 'generic-root-collection';
  id: string;
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
  id: string;
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

export interface GenericDocumentChildren {
  type: 'generic-document-children';
  collection: GenericSubCollection;
}

export interface LiteralDocumentChildren {
  type: 'literal-document-children';
  collections: LiteralSubCollection[];
}

export type DocumentChildren = GenericDocumentChildren | LiteralDocumentChildren;
