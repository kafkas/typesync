import {
  GenericDocument,
  GenericRootCollection,
  GenericSubCollection,
  LiteralDocument,
  LiteralRootCollection,
  LiteralSubCollection,
  SchemaGraph,
} from './interfaces.js';

export class SchemaGraphImpl implements SchemaGraph {
  private readonly rootCollectionsById = new Map<string, RootCollectionImpl>();

  public get rootCollections() {
    return Array.from(this.rootCollectionsById.values());
  }
}

export class GenericRootCollectionImpl implements GenericRootCollection {
  public readonly type = 'generic-root-collection';

  public get id() {
    return this.genericIdWithBraces;
  }

  public get genericIdWithBraces() {
    return `{${this.genericId}}`;
  }

  public get path() {
    return this.id;
  }

  public constructor(
    public readonly genericId: string,
    public readonly children: CollectionChildrenImpl
  ) {}
}

export class LiteralRootCollectionImpl implements LiteralRootCollection {
  public readonly type = 'literal-root-collection';

  public get path() {
    return this.id;
  }

  public constructor(
    public readonly id: string,
    public readonly children: CollectionChildrenImpl
  ) {}
}

type RootCollectionImpl = GenericRootCollectionImpl | LiteralRootCollectionImpl;

export class GenericSubCollectionImpl implements GenericSubCollection {
  public readonly type = 'generic-sub-collection';

  public get id() {
    return this.genericIdWithBraces;
  }

  public get genericIdWithBraces() {
    return `{${this.genericId}}`;
  }

  public get path() {
    return `${this.parent.id}/${this.id}`;
  }

  public constructor(
    public readonly genericId: string,
    public readonly parent: DocumentImpl,
    public readonly children: CollectionChildrenImpl
  ) {}
}

export class LiteralSubCollectionImpl implements LiteralSubCollection {
  public readonly type = 'literal-sub-collection';

  public get path() {
    return `${this.parent.id}/${this.id}`;
  }

  public constructor(
    public readonly id: string,
    public readonly parent: DocumentImpl,
    public readonly children: CollectionChildrenImpl
  ) {}
}

export interface GenericCollectionChildrenImpl {
  type: 'generic-collection-children';
  document: GenericDocumentImpl;
}

export interface LiteralCollectionChildrenImpl {
  type: 'literal-collection-children';
  documents: LiteralDocumentImpl[];
}

export type CollectionChildrenImpl = GenericCollectionChildrenImpl | LiteralCollectionChildrenImpl;

type SubCollectionImpl = GenericSubCollectionImpl | LiteralSubCollectionImpl;

type CollectionImpl = RootCollectionImpl | SubCollectionImpl;

export class GenericDocumentImpl implements GenericDocument {
  public readonly type = 'generic-document';

  public get id() {
    return this.genericIdWithBraces;
  }

  public get genericIdWithBraces() {
    return `{${this.genericId}}`;
  }

  public get path() {
    return `${this.parent.path}/${this.id}`;
  }

  public constructor(
    public readonly genericId: string,
    public readonly parent: CollectionImpl,
    public readonly children: DocumentChildrenImpl | null
  ) {}
}

export class LiteralDocumentImpl implements LiteralDocument {
  public readonly type = 'literal-document';

  public get path() {
    return `${this.parent.path}/${this.id}`;
  }

  public constructor(
    public readonly id: string,
    public readonly parent: CollectionImpl,
    public readonly children: DocumentChildrenImpl | null
  ) {}
}

interface GenericDocumentChildrenImpl {
  type: 'generic-document-children';
  collection: GenericSubCollectionImpl;
}

interface LiteralDocumentChildrenImpl {
  type: 'literal-document-children';
  collections: LiteralSubCollectionImpl[];
}

type DocumentChildrenImpl = GenericDocumentChildrenImpl | LiteralDocumentChildrenImpl;

export type DocumentImpl = GenericDocumentImpl | LiteralDocumentImpl;
