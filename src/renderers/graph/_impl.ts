import { StringBuilder } from '@proficient/ds';

import { GraphGeneration } from '../../generators/graph/index.js';
import { space } from '../../util/space.js';
import type { RenderedFile } from '../_types.js';
import type { GraphRenderer, GraphRendererConfig } from './_types.js';

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
}

export function createGraphRenderer(config: GraphRendererConfig): GraphRenderer {
  return new GraphRendererImpl(config);
}
