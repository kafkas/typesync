import { StringBuilder } from '@proficient/ds';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

import {
  MisplacedStartMarkerError,
  MissingEndMarkerError,
  MissingGraphOutputFileError,
  MissingStartMarkerError,
} from '../../errors/renderer.js';
import { GraphGeneration, type MermaidGraph, type MermaidGraphNode } from '../../generators/graph/index.js';
import { space } from '../../util/space.js';
import type { RenderedFile } from '../_types.js';
import type { GraphRenderer, GraphRendererConfig } from './_types.js';

class GraphRendererImpl implements GraphRenderer {
  public readonly type = 'graph';

  public constructor(private readonly config: GraphRendererConfig) {}

  public async render(generation: GraphGeneration): Promise<RenderedFile> {
    const { graph } = generation;
    const { lines, startMarkerLineIdx } = await this.preprocessOutputFile();
    const links = this.buildLinksForGraph(graph);

    const b = new StringBuilder();

    lines.forEach((line, lineIdx) => {
      if (lineIdx === startMarkerLineIdx + 1) {
        b.append('```mermaid' + `\n`);
        b.append(`graph ${graph.orientation}` + `\n`);
        links.forEach(link => {
          const [leftNodeId, rightNodeId] = link;
          b.append(space(4) + leftNodeId + ' --> ' + rightNodeId + `\n`);
        });
        b.append('```' + `\n`);
      }
      b.append(`${line}`);
      if (lineIdx !== lines.length - 1) {
        b.append('\n');
      }
    });

    return { content: b.toString() };
  }

  private async preprocessOutputFile() {
    const { pathToOutputFile, startMarker, endMarker } = this.config;

    if (!existsSync(pathToOutputFile)) {
      throw new MissingGraphOutputFileError(pathToOutputFile);
    }

    const outputFileContent = (await readFile(pathToOutputFile)).toString();
    const lines = outputFileContent.split('\n');
    const startMarkerLineIdx = lines.findIndex(line => this.doesLineContainMarker(line, startMarker));
    const endMarkerLineIdx = lines.findIndex(line => this.doesLineContainMarker(line, endMarker));

    if (startMarkerLineIdx === -1) {
      throw new MissingStartMarkerError(pathToOutputFile, startMarker);
    }

    if (endMarkerLineIdx === -1) {
      throw new MissingEndMarkerError(pathToOutputFile, endMarker);
    }

    if (startMarkerLineIdx >= endMarkerLineIdx) {
      throw new MisplacedStartMarkerError(pathToOutputFile, startMarker, endMarker);
    }

    lines.splice(startMarkerLineIdx + 1, endMarkerLineIdx - startMarkerLineIdx - 1);

    return { lines, startMarkerLineIdx };
  }

  private doesLineContainMarker(line: string, marker: string) {
    if (!line.trimStart().startsWith('<!--')) return false;
    const parts = line.split(' ');
    return parts.some(part => part === marker);
  }

  private buildLinksForGraph(graph: MermaidGraph) {
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
