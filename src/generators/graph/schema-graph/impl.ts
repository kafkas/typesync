import { assertNever } from '../../../util/assert.js';
import {
  GenericDocument,
  GenericDocumentChildren,
  GenericRootCollection,
  GenericSubCollection,
  LiteralDocument,
  LiteralDocumentChildren,
  LiteralRootCollection,
  LiteralSubCollection,
  SchemaGraph,
} from './interfaces.js';

export class SchemaGraphImpl implements SchemaGraph {
  public constructor(public readonly children: GraphChildrenImpl) {}
}

export interface GenericGraphChildrenImpl {
  type: 'generic-graph-children';
  collection: GenericRootCollectionImpl;
}

export interface LiteralGraphChildrenImpl {
  type: 'literal-graph-children';
  collections: LiteralRootCollectionImpl[];
}

export type GraphChildrenImpl = GenericGraphChildrenImpl | LiteralGraphChildrenImpl;

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

export type RootCollectionImpl = GenericRootCollectionImpl | LiteralRootCollectionImpl;

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

export type SubCollectionImpl = GenericSubCollectionImpl | LiteralSubCollectionImpl;

export type CollectionImpl = RootCollectionImpl | SubCollectionImpl;

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
    public parent: CollectionImpl,
    public children: DocumentChildrenImpl | null
  ) {}

  public setParent(parent: CollectionImpl) {
    this.parent = parent;
  }

  public addLiteralSubCollection(collection: LiteralSubCollectionImpl) {
    if (this.children) {
      if (this.children.type === 'generic-document-children') {
        throw new Error('Parent already has generic document children');
      } else if (this.children.type === 'literal-document-children') {
        this.children.addCollection(collection);
      } else {
        assertNever(this.children);
      }
    } else {
      this.children = new LiteralDocumentChildrenImpl(new Map([[collection.id, collection]]));
    }
  }
}

export class LiteralDocumentImpl implements LiteralDocument {
  public readonly type = 'literal-document';

  public get path() {
    return `${this.parent.path}/${this.id}`;
  }

  public constructor(
    public readonly id: string,
    public readonly parent: CollectionImpl,
    public children: DocumentChildrenImpl | null
  ) {}

  public addLiteralSubCollection(collection: LiteralSubCollectionImpl) {
    if (this.children) {
      if (this.children.type === 'generic-document-children') {
        throw new Error('Parent already has generic document children');
      } else if (this.children.type === 'literal-document-children') {
        this.children.addCollection(collection);
      } else {
        assertNever(this.children);
      }
    } else {
      this.children = new LiteralDocumentChildrenImpl(new Map([[collection.id, collection]]));
    }
  }
}

export class GenericDocumentChildrenImpl implements GenericDocumentChildren {
  public readonly type = 'generic-document-children';

  public constructor(public readonly collection: GenericSubCollectionImpl) {}
}

export class LiteralDocumentChildrenImpl implements LiteralDocumentChildren {
  public readonly type = 'literal-document-children';

  public get collections() {
    return Array.from(this.collectionsById.values());
  }

  public constructor(private readonly collectionsById: Map<string, LiteralSubCollectionImpl>) {}

  public addCollection(collection: LiteralSubCollectionImpl) {
    if (this.collectionsById.has(collection.id)) {
      throw new Error(`The collection ${collection.path} is already in this children object.`);
    }
    this.collectionsById.set(collection.id, collection);
  }
}

export type DocumentChildrenImpl = GenericDocumentChildrenImpl | LiteralDocumentChildrenImpl;

export type DocumentImpl = GenericDocumentImpl | LiteralDocumentImpl;
