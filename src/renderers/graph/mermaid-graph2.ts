class MermaidGraphNodeImpl implements MermaidGraphNode {
  public get pointsTo() {
    return [...this.#pointsToOrdering];
  }

  readonly #pointsTo = new Map<string, MermaidGraphNode>();
  readonly #pointsToOrdering = new Array<MermaidGraphNode>();

  public constructor(
    public readonly id: string,
    public readonly label: string
  ) {}

  public linkTo(to: MermaidGraphNode) {
    if (this.#pointsTo.has(to.id)) {
      return;
    }
    this.#pointsTo.set(to.id, to);
    this.#pointsToOrdering.push(to);
  }
}

export interface MermaidGraphNode {
  readonly id: string;
  readonly label: string;
  readonly pointsTo: MermaidGraphNode[];
}

export type MermaidGraphOrientation2 = 'TB' | 'LR';

export class MermaidGraph2 {
  private readonly nodesById = new Map<string, MermaidGraphNodeImpl>();
  private readonly rootNodesById = new Map<string, MermaidGraphNodeImpl>();

  public get rootNodes(): MermaidGraphNode[] {
    return Array.from(this.rootNodesById.values());
  }

  public constructor(public readonly orientation: MermaidGraphOrientation2) {}

  public createNode(label: string): MermaidGraphNode {
    const id = this.createIdForNewNode();
    const node = new MermaidGraphNodeImpl(id, label);
    this.nodesById.set(id, node);
    this.rootNodesById.set(id, node);
    return node;
  }

  /**
   * Creates a link from the `from` node to the `to` node.
   */
  public link(from: MermaidGraphNode, to: MermaidGraphNode) {
    const fromNode = this.validateNodeExists(from);
    const toNode = this.validateNodeExists(to);
    fromNode.linkTo(toNode);
    this.rootNodesById.delete(toNode.id);
  }

  private validateNodeExists(node: MermaidGraphNode) {
    const existingNode = this.nodesById.get(node.id);
    if (existingNode === undefined) {
      throw new Error(`The graph does not contain a node with the ID '${node.id}'.`);
    }
    return existingNode;
  }

  private createIdForNewNode() {
    return `node${this.nodesById.size + 1}`;
  }
}
