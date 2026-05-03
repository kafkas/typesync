import { resolve } from 'node:path';

import { MermaidGraph } from '../../../generators/graph/index.js';
import { getDirName } from '../../../util/fs.js';
import { createGraphRenderer } from '../_impl.js';

const fixturePath = (filename: string) => resolve(getDirName(import.meta.url), '__fixtures__', filename);

function createRenderer(pathToOutputFile = fixturePath('with-markers.md')) {
  return createGraphRenderer({
    startMarker: 'typesync-start',
    endMarker: 'typesync-end',
    pathToOutputFile,
  });
}

function buildGraphWithNestedSubcollections() {
  const g = new MermaidGraph('LR');
  const booksCol = g.createNode('books');
  const bookDoc = g.createNode('{bookId}');
  const reviewsCol = g.createNode('reviews');
  const reviewDoc = g.createNode('{reviewId}');
  const authorsCol = g.createNode('authors');
  const authorDoc = g.createNode('{authorId}');
  g.link(booksCol, bookDoc);
  g.link(bookDoc, reviewsCol);
  g.link(reviewsCol, reviewDoc);
  g.link(authorsCol, authorDoc);
  return g;
}

describe('GraphRendererImpl', () => {
  it('renders a Mermaid graph fenced block between the start and end markers, preserving surrounding content', async () => {
    const result = await createRenderer().render({ type: 'graph', graph: buildGraphWithNestedSubcollections() });
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/render-graph.md');
  });

  it('uses the orientation of the input graph in the rendered Mermaid header', async () => {
    const verticalGraph = new MermaidGraph('TB');
    const col = verticalGraph.createNode('users');
    const doc = verticalGraph.createNode('{userId}');
    verticalGraph.link(col, doc);

    const result = await createRenderer().render({ type: 'graph', graph: verticalGraph });
    expect(result.content).toContain('graph TB');
  });

  it('throws when the configured output file does not exist', async () => {
    const renderer = createRenderer(fixturePath('does-not-exist.md'));
    await expect(renderer.render({ type: 'graph', graph: new MermaidGraph('LR') })).rejects.toThrow(/does not exist/);
  });

  it('throws when the start marker is missing from the output file', async () => {
    const renderer = createRenderer(fixturePath('missing-start-marker.md'));
    await expect(renderer.render({ type: 'graph', graph: new MermaidGraph('LR') })).rejects.toThrow(
      /start marker.*missing/
    );
  });

  it('throws when the end marker is missing from the output file', async () => {
    const renderer = createRenderer(fixturePath('missing-end-marker.md'));
    await expect(renderer.render({ type: 'graph', graph: new MermaidGraph('LR') })).rejects.toThrow(
      /end marker.*missing/
    );
  });

  it('throws when the start marker appears after the end marker in the output file', async () => {
    const renderer = createRenderer(fixturePath('misplaced-markers.md'));
    await expect(renderer.render({ type: 'graph', graph: new MermaidGraph('LR') })).rejects.toThrow(
      /must be placed before/
    );
  });
});
