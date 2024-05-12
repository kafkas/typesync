import { GenericDocument, RootCollection, SubCollection, generateMermaidGraph } from '../graph.js';

describe('graph', () => {
  it(`builds graph correctly`, () => {
    const booksCollection = new RootCollection('books', []);
    const genericBookDocument = new GenericDocument('bookId', booksCollection, []);
    booksCollection.documents.push(genericBookDocument);
    const reviewsSubCollection = new SubCollection('reviews', []);
    const chaptersCollection = new SubCollection('chapters', []);
    const translationsCollection = new SubCollection('translations', []);
    genericBookDocument.subCollections.push(reviewsSubCollection, chaptersCollection, translationsCollection);
    const graph = generateMermaidGraph([booksCollection]);

    expect(graph).toMatchSnapshot();
  });
});
