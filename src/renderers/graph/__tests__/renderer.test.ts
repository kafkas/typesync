import { resolve } from 'path';

import { MermaidGraph } from '../../../generators/graph/index.js';
import { getDirName } from '../../../util/fs.js';
import { createGraphRenderer } from '../_impl.js';

describe('MermaidGraph', () => {
  it(`correctly renders a MermaidGraph`, async () => {
    const renderer = createGraphRenderer({
      startMarker: 'typesync-start',
      endMarker: 'typesync-end',
      pathToOutputFile: resolve(getDirName(import.meta.url), `template.md`),
    });

    const graph = new MermaidGraph('LR');
    const booksCol = graph.createNode('books');
    const bookDoc = graph.createNode('{bookId}');
    const reviewsCol = graph.createNode('reviews');
    const reviewDoc = graph.createNode('{reviewId}');
    const chaptersCol = graph.createNode('chapters');
    const chapterDoc = graph.createNode('{chapterId}');
    const translationsCol = graph.createNode('translations');
    const translationDoc = graph.createNode('{translationId}');
    const authorsCol = graph.createNode('authors');
    const authorDoc = graph.createNode('{authorId}');

    graph.link(booksCol, bookDoc);
    graph.link(bookDoc, reviewsCol);
    graph.link(reviewsCol, reviewDoc);
    graph.link(bookDoc, chaptersCol);
    graph.link(chaptersCol, chapterDoc);
    graph.link(bookDoc, translationsCol);
    graph.link(translationsCol, translationDoc);
    graph.link(authorsCol, authorDoc);

    expect(await renderer.render({ type: 'graph', graph })).toMatchSnapshot();
  });
});
