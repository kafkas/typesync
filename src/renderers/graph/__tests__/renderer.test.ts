import { resolve } from 'path';

import { GraphGeneration } from '../../../generators/graph/index.js';
import { getDirName } from '../../../util/fs.js';
import { createGraphRenderer } from '../_impl.js';

describe('GraphRendererImpl', () => {
  it(`correctly renders a Mermaid graph generation`, async () => {
    const renderer = createGraphRenderer({
      startMarker: 'typesync-start',
      endMarker: 'typesync-end',
      pathToOutputFile: resolve(getDirName(import.meta.url), `template.md`),
    });
    const graph: GraphGeneration = {
      type: 'graph',
      graph: {
        orientation: 'LR',
        links: [
          ['books', 'generic_bookId[bookId]'],
          ['generic_bookId[bookId]', 'reviews'],
          ['generic_bookId[bookId]', 'chapters'],
          ['generic_bookId[bookId]', 'translations'],
        ],
      },
    };
    const renderedGraph = await renderer.render(graph);
    expect(renderedGraph).toMatchSnapshot();
  });
});
