import { resolve } from 'path';

import { getDirName } from '../../../util/fs.js';
import { createGraphRenderer } from '../_impl.js';
import { MermaidGraph2 } from '../mermaid-graph2.js';

describe('MermaidGraph2', () => {
  it(`correctly renders a MermaidGraph2`, async () => {
    const renderer = createGraphRenderer({
      startMarker: 'typesync-start',
      endMarker: 'typesync-end',
      pathToOutputFile: resolve(getDirName(import.meta.url), `template.md`),
    });

    const graph = new MermaidGraph2('LR');
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

    expect(await renderer.render2(graph)).toMatchSnapshot();
  });
});
