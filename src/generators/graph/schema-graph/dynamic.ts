function isGenericId(id: string) {
  return id.startsWith('{') && id.endsWith('}');
}

export class CollectionNode {
  private readonly childNodesById = new Map<string, DocumentNode>();
  private readonly childNodesOrdering = new Array<DocumentNode>();

  public get children() {
    return [...this.childNodesOrdering];
  }

  public get isGeneric() {
    return isGenericId(this.id);
  }

  public constructor(public readonly id: string) {}

  public addChild(child: DocumentNode) {
    if (this.childNodesById.has(child.id)) {
      throw new Error(`This node already has a child with the ID '${child.id}'.`);
    }
    this.childNodesById.set(child.id, child);
    this.childNodesOrdering.push(child);
  }

  public hasChild(id: string) {
    return this.childNodesById.has(id);
  }
}

export class DocumentNode {
  private readonly childNodesById = new Map<string, CollectionNode>();
  private readonly childNodesOrdering = new Array<CollectionNode>();

  public get children() {
    return [...this.childNodesOrdering];
  }

  public get isGeneric() {
    return isGenericId(this.id);
  }
  public constructor(public readonly id: string) {}

  public addChild(child: CollectionNode) {
    if (this.childNodesById.has(child.id)) {
      throw new Error(`This node already has a child with the ID '${child.id}'.`);
    }
    this.childNodesById.set(child.id, child);
    this.childNodesOrdering.push(child);
  }

  public hasChild(id: string) {
    return this.childNodesById.has(id);
  }
}
