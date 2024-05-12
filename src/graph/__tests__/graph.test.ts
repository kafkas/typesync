import { buildMermaidGraph } from '../graph.js';
import { GenericDocument, RootCollection, SubCollection } from '../nodes.js';
import { MermaidGraph } from '../types.js';

describe('graph', () => {
  it(`builds graph correctly`, () => {
    const booksCollection = new RootCollection('books', []);
    const genericBookDocument = new GenericDocument('bookId', booksCollection, []);
    booksCollection.documents.push(genericBookDocument);
    const reviewsSubCollection = new SubCollection('reviews', []);
    const chaptersCollection = new SubCollection('chapters', []);
    const translationsCollection = new SubCollection('translations', []);
    genericBookDocument.subCollections.push(reviewsSubCollection, chaptersCollection, translationsCollection);
    const graph = buildMermaidGraph('horizontal', [booksCollection]);

    const expectedGraph: MermaidGraph = {
      orientation: 'LR',
      links: [
        ['books', 'generic_bookId[bookId]'],
        ['generic_bookId[bookId]', 'reviews'],
        ['generic_bookId[bookId]', 'chapters'],
        ['generic_bookId[bookId]', 'translations'],
      ],
    };

    expect(graph).toEqual(expectedGraph);
  });
});
