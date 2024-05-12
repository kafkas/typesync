import { GraphGeneratorImpl } from '../_impl.js';
import { MermaidGraph } from '../_types.js';
import { GenericDocument, RootCollection, SubCollection } from '../schema-graph.js';

describe('GraphGeneratorImpl', () => {
  it(`correctly builds a Mermaid graph from a SchemaGraph`, () => {
    const generator = new GraphGeneratorImpl({ orientation: 'horizontal' });

    const booksCollection = new RootCollection('books', []);
    const genericBookDocument = new GenericDocument('bookId', booksCollection, []);
    booksCollection.documents.push(genericBookDocument);
    const reviewsSubCollection = new SubCollection('reviews', []);
    const chaptersCollection = new SubCollection('chapters', []);
    const translationsCollection = new SubCollection('translations', []);
    genericBookDocument.subCollections.push(reviewsSubCollection, chaptersCollection, translationsCollection);

    const graph = generator.buildMermaidGraph({ rootCollections: [booksCollection] });

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
