import lodash from 'lodash';

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

export type MermaidGraphOrientation = 'TB' | 'LR';

export class MermaidGraph {
  private readonly nodesById = new Map<string, MermaidGraphNodeImpl>();
  private readonly rootNodesById = new Map<string, MermaidGraphNodeImpl>();

  public get rootNodes(): MermaidGraphNode[] {
    return Array.from(this.rootNodesById.values());
  }

  public constructor(public readonly orientation: MermaidGraphOrientation) {}

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

  public equals(that: MermaidGraph) {
    if (this.nodesById.size !== that.nodesById.size) return false;
    if (this.rootNodesById.size !== that.rootNodesById.size) return false;
    for (const [, thisNode] of this.nodesById) {
      const thatNode = that.nodesById.get(thisNode.id);
      if (thatNode === undefined) return false;
      if (thatNode.id !== thisNode.id || thatNode.label !== thisNode.label) return false;
      const thisNodePointsToIds = thisNode.pointsTo.map(node => node.id);
      const thatNodePointsToIds = thatNode.pointsTo.map(node => node.id);
      if (!lodash.isEqual(thisNodePointsToIds, thatNodePointsToIds)) return false;
    }
    return true;
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
