export interface SchemaGraphJson {
  root: SchemaGraphRootJson;
}

export interface SchemaGraphRootGenericJson {
  type: 'generic';
  collection: GenericRootCollectionJson;
}

export interface SchemaGraphRootLiteralJson {
  type: 'literal';
  collections: LiteralRootCollectionJson[];
}

export type SchemaGraphRootJson = SchemaGraphRootGenericJson | SchemaGraphRootLiteralJson;

export interface GenericRootCollectionJson {
  type: 'generic';
  genericId: string;
  children: CollectionChildrenJson;
}

export interface LiteralRootCollectionJson {
  type: 'literal';
  id: string;
  children: CollectionChildrenJson;
}

export interface GenericSubCollectionJson {
  type: 'generic';
  genericId: string;
  children: CollectionChildrenJson;
}

export interface LiteralSubCollectionJson {
  type: 'literal';
  id: string;
  children: CollectionChildrenJson;
}

export type RootCollectionJson = GenericRootCollectionJson | LiteralRootCollectionJson;
export type SubCollectionJson = GenericSubCollectionJson | LiteralSubCollectionJson;
export type CollectionJson = RootCollectionJson | SubCollectionJson;

export interface CollectionChildrenGenericJson {
  type: 'generic';
  document: GenericDocumentJson;
}

export interface CollectionChildrenLiteralJson {
  type: 'literal';
  documents: LiteralDocumentJson[];
}

export type CollectionChildrenJson = CollectionChildrenGenericJson | CollectionChildrenLiteralJson;

export interface GenericDocumentJson {
  type: 'generic-document';
  genericId: string;
  children: DocumentChildrenJson | null;
}

export interface LiteralDocumentJson {
  type: 'literal-document';
  id: string;
  children: DocumentChildrenJson | null;
}

export type DocumentJson = GenericDocumentJson | LiteralDocumentJson;

export interface DocumentChildrenGenericJson {
  type: 'generic';
  collection: GenericSubCollectionJson;
}

export interface DocumentChildrenLiteralJson {
  type: 'literal';
  collections: LiteralSubCollectionJson[];
}

export type DocumentChildrenJson = DocumentChildrenGenericJson | DocumentChildrenLiteralJson;
