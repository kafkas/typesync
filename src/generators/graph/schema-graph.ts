export class RootCollection {
  public readonly type = 'root-collection';

  public constructor(
    public readonly id: string,
    public readonly documents: Document[]
  ) {}
}

export class SubCollection {
  public readonly type = 'sub-collection';

  public constructor(
    public readonly id: string,
    public readonly documents: Document[]
  ) {}
}

export type Collection = RootCollection | SubCollection;

export class GenericDocument {
  public readonly type = 'generic-document';

  public constructor(
    public readonly genericId: string,
    public readonly parentCollection: Collection,
    public readonly subCollections: SubCollection[]
  ) {}
}

export class LiteralDocument {
  public readonly type = 'literal-document';

  public constructor(
    public readonly id: string,
    public readonly parentCollection: Collection,
    public readonly subCollections: SubCollection[]
  ) {}
}

export type Document = GenericDocument | LiteralDocument;

export interface SchemaGraph {
  rootCollections: RootCollection[];
}
