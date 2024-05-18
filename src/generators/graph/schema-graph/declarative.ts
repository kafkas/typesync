export interface SchemaGraph {
  root: GraphChildren;
}

export interface GenericGraphChildren {
  type: 'generic';
  collection: GenericRootCollection;
}

export interface LiteralGraphChildren {
  type: 'literal';
  collections: LiteralRootCollection[];
}

export type GraphChildren = GenericGraphChildren | LiteralGraphChildren;

export interface GenericRootCollection {
  type: 'generic';
  genericId: string;
  children: CollectionChildren;
}

export interface LiteralRootCollection {
  type: 'literal';
  id: string;
  children: CollectionChildren;
}

export interface GenericSubCollection {
  type: 'generic';
  genericId: string;
  children: CollectionChildren;
}

export interface LiteralSubCollection {
  type: 'literal';
  id: string;
  children: CollectionChildren;
}

export type RootCollection = GenericRootCollection | LiteralRootCollection;
export type SubCollection = GenericSubCollection | LiteralSubCollection;
export type Collection = RootCollection | SubCollection;

export interface GenericCollectionChildren {
  type: 'generic';
  document: GenericDocument;
}

export interface LiteralCollectionChildren {
  type: 'literal';
  documents: LiteralDocument[];
}

export type CollectionChildren = GenericCollectionChildren | LiteralCollectionChildren;

export interface GenericDocument {
  type: 'generic-document';
  genericId: string;
  children: DocumentChildren | null;
}

export interface LiteralDocument {
  type: 'literal-document';
  id: string;
  children: DocumentChildren | null;
}

export type Document = GenericDocument | LiteralDocument;

export interface GenericDocumentChildren {
  type: 'generic';
  collection: GenericSubCollection;
}

export interface LiteralDocumentChildren {
  type: 'literal';
  collections: LiteralSubCollection[];
}

export type DocumentChildren = GenericDocumentChildren | LiteralDocumentChildren;
