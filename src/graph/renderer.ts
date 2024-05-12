import { StringBuilder } from '@proficient/ds';

import { MermaidGraph } from './types.js';

const TAB = '    ';

export function renderMermaidGraph(graph: MermaidGraph): string {
  const b = new StringBuilder();
  b.append(`graph ${graph.orientation}` + `\n`);
  graph.links.forEach(link => {
    const [leftNodeId, rightNodeId] = link;
    b.append(TAB + leftNodeId + ' --> ' + rightNodeId + `\n`);
  });
  return b.toString();
}
