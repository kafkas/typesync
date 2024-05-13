import { CollectionChildren, GenericRootCollection, LiteralRootCollection, SchemaGraph } from './interfaces.js';

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
    public readonly children: CollectionChildren
  ) {}
}

export class LiteralRootCollectionImpl implements LiteralRootCollection {
  public readonly type = 'literal-root-collection';

  public get path() {
    return this.id;
  }

  public constructor(
    public readonly id: string,
    public readonly children: CollectionChildren
  ) {}
}

type RootCollectionImpl = GenericRootCollectionImpl | LiteralRootCollectionImpl;
