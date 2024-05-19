import lodash from 'lodash';

import { assertNever } from '../../../util/assert.js';
import { AbstractCollection, AbstractDocument } from './abstract.js';
import type { CollectionChildrenJson, DocumentChildrenJson, SchemaGraphJson, SchemaGraphRootJson } from './json.js';

export function createSchemaGraph(fromJson: SchemaGraphJson) {
  return new SchemaGraph(fromJson.root);
}

export class SchemaGraph {
  public get root(): SchemaGraphRoot {
    if (this.rootJson.type === 'generic') {
      const { collection } = this.rootJson;
      return { type: 'generic', collection: new GenericRootCollection(collection.genericId, collection.children) };
    } else if (this.rootJson.type === 'literal') {
      const { collections } = this.rootJson;
      return {
        type: 'literal',
        collections: collections
          .map(collection => new LiteralRootCollection(collection.id, collection.children))
          .sort((c1, c2) => c1.id.localeCompare(c2.id)),
      };
    } else {
      assertNever(this.rootJson);
    }
  }

  public constructor(private readonly rootJson: SchemaGraphRootJson) {}

  public equals(that: SchemaGraph) {
    return lodash.isEqual(this.rootJson, that.rootJson);
  }
}

export interface SchemaGraphRootGeneric {
  type: 'generic';
  collection: GenericRootCollection;
}

export interface SchemaGraphRootLiteral {
  type: 'literal';
  collections: LiteralRootCollection[];
}

export type SchemaGraphRoot = SchemaGraphRootGeneric | SchemaGraphRootLiteral;

export class GenericRootCollection extends AbstractCollection {
  public readonly type = 'generic';

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
    childrenJson: CollectionChildrenJson
  ) {
    super(childrenJson);
  }

  protected createGenericDocument(genericId: string, childrenJson: DocumentChildrenJson | null) {
    return new GenericDocument(genericId, this, childrenJson);
  }

  protected createLiteralDocument(id: string, childrenJson: DocumentChildrenJson | null) {
    return new LiteralDocument(id, this, childrenJson);
  }
}

export class LiteralRootCollection extends AbstractCollection {
  public readonly type = 'literal';

  public get path() {
    return this.id;
  }

  public constructor(
    public readonly id: string,
    childrenJson: CollectionChildrenJson
  ) {
    super(childrenJson);
  }

  protected createGenericDocument(genericId: string, childrenJson: DocumentChildrenJson | null) {
    return new GenericDocument(genericId, this, childrenJson);
  }

  protected createLiteralDocument(id: string, childrenJson: DocumentChildrenJson | null) {
    return new LiteralDocument(id, this, childrenJson);
  }
}

export type RootCollection = GenericRootCollection | LiteralRootCollection;

export class GenericSubCollection extends AbstractCollection {
  public readonly type = 'generic';

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
    public readonly parent: Document,
    childrenJson: CollectionChildrenJson
  ) {
    super(childrenJson);
  }

  protected createGenericDocument(genericId: string, childrenJson: DocumentChildrenJson | null) {
    return new GenericDocument(genericId, this, childrenJson);
  }

  protected createLiteralDocument(id: string, childrenJson: DocumentChildrenJson | null) {
    return new LiteralDocument(id, this, childrenJson);
  }
}

export class LiteralSubCollection extends AbstractCollection {
  public readonly type = 'literal';

  public get path() {
    return `${this.parent.id}/${this.id}`;
  }

  public constructor(
    public readonly id: string,
    public readonly parent: Document,
    childrenJson: CollectionChildrenJson
  ) {
    super(childrenJson);
  }

  protected createGenericDocument(genericId: string, childrenJson: DocumentChildrenJson | null) {
    return new GenericDocument(genericId, this, childrenJson);
  }

  protected createLiteralDocument(id: string, childrenJson: DocumentChildrenJson | null) {
    return new LiteralDocument(id, this, childrenJson);
  }
}

export interface CollectionChildrenGeneric {
  type: 'generic';
  document: GenericDocument;
}

export interface CollectionChildrenLiteral {
  type: 'literal';
  documents: LiteralDocument[];
}

export type CollectionChildren = CollectionChildrenGeneric | CollectionChildrenLiteral;

export type SubCollection = GenericSubCollection | LiteralSubCollection;

export type Collection = RootCollection | SubCollection;

export class GenericDocument extends AbstractDocument {
  public readonly type = 'generic';

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
    public readonly parent: Collection,
    childrenJson: DocumentChildrenJson | null
  ) {
    super(childrenJson);
  }

  protected createGenericSubCollection(genericId: string, childrenJson: CollectionChildrenJson) {
    return new GenericSubCollection(genericId, this, childrenJson);
  }

  protected createLiteralSubCollection(id: string, childrenJson: CollectionChildrenJson) {
    return new LiteralSubCollection(id, this, childrenJson);
  }
}

export class LiteralDocument extends AbstractDocument {
  public readonly type = 'literal';

  public get path() {
    return `${this.parent.path}/${this.id}`;
  }

  public constructor(
    public readonly id: string,
    public readonly parent: Collection,
    childrenJson: DocumentChildrenJson | null
  ) {
    super(childrenJson);
  }

  protected createGenericSubCollection(genericId: string, childrenJson: CollectionChildrenJson) {
    return new GenericSubCollection(genericId, this, childrenJson);
  }

  protected createLiteralSubCollection(id: string, childrenJson: CollectionChildrenJson) {
    return new LiteralSubCollection(id, this, childrenJson);
  }
}

export interface DocumentChildrenGeneric {
  type: 'generic';
  collection: GenericSubCollection;
}

export interface DocumentChildrenLiteral {
  type: 'literal';
  collections: LiteralSubCollection[];
}

export type DocumentChildren = DocumentChildrenGeneric | DocumentChildrenLiteral;

export type Document = GenericDocument | LiteralDocument;
