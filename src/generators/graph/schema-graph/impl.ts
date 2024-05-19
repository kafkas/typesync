import { assertNever } from '../../../util/assert.js';
import { CollectionChildrenJson, DocumentChildrenJson, SchemaGraphJson, SchemaGraphRootJson } from './json.js';

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
        collections: collections.map(collection => new LiteralRootCollection(collection.id, collection.children)),
      };
    } else {
      assertNever(this.rootJson);
    }
  }

  public constructor(private readonly rootJson: SchemaGraphRootJson) {}
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

export class GenericRootCollection {
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

  public get children(): CollectionChildren {
    if (this.childrenJson.type === 'generic') {
      const { document } = this.childrenJson;
      return { type: 'generic', document: new GenericDocument(document.genericId, this, document.children) };
    } else if (this.childrenJson.type === 'literal') {
      const { documents } = this.childrenJson;
      return {
        type: 'literal',
        documents: documents.map(document => new LiteralDocument(document.id, this, document.children)),
      };
    } else {
      assertNever(this.childrenJson);
    }
  }

  public constructor(
    public readonly genericId: string,
    private readonly childrenJson: CollectionChildrenJson
  ) {}
}

export class LiteralRootCollection {
  public readonly type = 'literal';

  public get path() {
    return this.id;
  }

  public get children(): CollectionChildren {
    if (this.childrenJson.type === 'generic') {
      const { document } = this.childrenJson;
      return { type: 'generic', document: new GenericDocument(document.genericId, this, document.children) };
    } else if (this.childrenJson.type === 'literal') {
      const { documents } = this.childrenJson;
      return {
        type: 'literal',
        documents: documents.map(document => new LiteralDocument(document.id, this, document.children)),
      };
    } else {
      assertNever(this.childrenJson);
    }
  }

  public constructor(
    public readonly id: string,
    private readonly childrenJson: CollectionChildrenJson
  ) {}
}

export type RootCollection = GenericRootCollection | LiteralRootCollection;

export class GenericSubCollection {
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

  public get children(): CollectionChildren {
    if (this.childrenJson.type === 'generic') {
      const { document } = this.childrenJson;
      return { type: 'generic', document: new GenericDocument(document.genericId, this, document.children) };
    } else if (this.childrenJson.type === 'literal') {
      const { documents } = this.childrenJson;
      return {
        type: 'literal',
        documents: documents.map(document => new LiteralDocument(document.id, this, document.children)),
      };
    } else {
      assertNever(this.childrenJson);
    }
  }

  public constructor(
    public readonly genericId: string,
    public readonly parent: Document,
    private readonly childrenJson: CollectionChildrenJson
  ) {}
}

export class LiteralSubCollection {
  public readonly type = 'literal';

  public get path() {
    return `${this.parent.id}/${this.id}`;
  }

  public get children(): CollectionChildren {
    if (this.childrenJson.type === 'generic') {
      const { document } = this.childrenJson;
      return { type: 'generic', document: new GenericDocument(document.genericId, this, document.children) };
    } else if (this.childrenJson.type === 'literal') {
      const { documents } = this.childrenJson;
      return {
        type: 'literal',
        documents: documents.map(document => new LiteralDocument(document.id, this, document.children)),
      };
    } else {
      assertNever(this.childrenJson);
    }
  }

  public constructor(
    public readonly id: string,
    public readonly parent: Document,
    private readonly childrenJson: CollectionChildrenJson
  ) {}
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

export class GenericDocument {
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

  public get children(): DocumentChildren | null {
    if (this.childrenJson === null) return null;
    if (this.childrenJson.type === 'generic') {
      const { collection } = this.childrenJson;
      return { type: 'generic', collection: new GenericSubCollection(collection.genericId, this, collection.children) };
    } else if (this.childrenJson.type === 'literal') {
      const { collections } = this.childrenJson;
      return {
        type: 'literal',
        collections: collections.map(collection => new LiteralSubCollection(collection.id, this, collection.children)),
      };
    } else {
      assertNever(this.childrenJson);
    }
  }

  public constructor(
    public readonly genericId: string,
    public readonly parent: Collection,
    private readonly childrenJson: DocumentChildrenJson | null
  ) {}
}

export class LiteralDocument {
  public readonly type = 'literal';

  public get path() {
    return `${this.parent.path}/${this.id}`;
  }

  public get children(): DocumentChildren | null {
    if (this.childrenJson === null) return null;
    if (this.childrenJson.type === 'generic') {
      const { collection } = this.childrenJson;
      return { type: 'generic', collection: new GenericSubCollection(collection.genericId, this, collection.children) };
    } else if (this.childrenJson.type === 'literal') {
      const { collections } = this.childrenJson;
      return {
        type: 'literal',
        collections: collections.map(collection => new LiteralSubCollection(collection.id, this, collection.children)),
      };
    } else {
      assertNever(this.childrenJson);
    }
  }

  public constructor(
    public readonly id: string,
    public readonly parent: Collection,
    private readonly childrenJson: DocumentChildrenJson | null
  ) {}
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
