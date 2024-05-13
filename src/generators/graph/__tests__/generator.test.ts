import { GraphGeneratorImpl } from '../_impl.js';
import { MermaidGraph } from '../_types.js';
import { SchemaGraph } from '../schema-graph.js';

describe('GraphGeneratorImpl', () => {
  it(`correctly builds a Mermaid graph from a SchemaGraph`, () => {
    const generator = new GraphGeneratorImpl({ orientation: 'horizontal' });

    const graph = new SchemaGraph();
    const booksCollection = graph.addRootCollection('books');
    const bookDocument = booksCollection.setGenericDocument('bookId');
    bookDocument.addSubCollection('reviews');
    bookDocument.addSubCollection('chapters');
    bookDocument.addSubCollection('translations');

    const mermaidGraph = generator.buildMermaidGraph(graph);

    const expectedMermaidGraph: MermaidGraph = {
      orientation: 'LR',
      links: [
        ['books', 'generic_bookId[bookId]'],
        ['generic_bookId[bookId]', 'reviews'],
        ['generic_bookId[bookId]', 'chapters'],
        ['generic_bookId[bookId]', 'translations'],
      ],
    };

    expect(mermaidGraph).toEqual(expectedMermaidGraph);
  });
});
