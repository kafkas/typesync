import { StringBuilder } from '@proficient/ds';

import { GraphGeneration } from '../../generators/graph/index.js';
import { space } from '../../util/space.js';
import type { RenderedFile } from '../_types.js';
import type { GraphRenderer, GraphRendererConfig } from './_types.js';
import { MermaidGraph2, MermaidGraphNode } from './mermaid-graph2.js';

class GraphRendererImpl implements GraphRenderer {
  public readonly type = 'python';

  public constructor(private readonly config: GraphRendererConfig) {}

  public async render(generation: GraphGeneration): Promise<RenderedFile> {
    const { graph } = generation;

    const b = new StringBuilder();

    b.append(`graph ${graph.orientation}` + `\n`);
    graph.links.forEach(link => {
      const [leftNodeId, rightNodeId] = link;
      b.append(space(4) + leftNodeId + ' --> ' + rightNodeId + `\n`);
    });

    return { content: b.toString() };
  }

  public async render2(graph: MermaidGraph2): Promise<RenderedFile> {
    const links = this.buildLinksForGraph(graph);
    const b = new StringBuilder();
    b.append(`graph ${graph.orientation}` + `\n`);
    links.forEach(link => {
      const [leftNodeId, rightNodeId] = link;
      b.append(space(4) + leftNodeId + ' --> ' + rightNodeId + `\n`);
    });
    return { content: b.toString() };
  }

  private buildLinksForGraph(graph: MermaidGraph2) {
    const { rootNodes } = graph;
    return rootNodes.map(rootNode => this.buildLinksForNode(rootNode)).flat(1);
  }

  private buildLinksForNode(node: MermaidGraphNode) {
    const links: [string, string][] = [];
    const { pointsTo } = node;
    for (const nextNode of pointsTo) {
      links.push([`${node.id}["${node.label}"]`, `${nextNode.id}["${nextNode.label}"]`]);
      const nextLinks = this.buildLinksForNode(nextNode);
      links.push(...nextLinks);
    }
    return links;
  }
}

export function createGraphRenderer(config: GraphRendererConfig): GraphRenderer {
  return new GraphRendererImpl(config);
}
