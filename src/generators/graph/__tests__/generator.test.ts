import { schema } from '../../../schema/index.js';
import { GraphGeneratorImpl } from '../_impl.js';
import { MermaidGraph } from '../_types.js';
import { SchemaGraph } from '../schema-graph.js';

describe('GraphGeneratorImpl', () => {
  describe('buildSchemaGraphFromSchema()', () => {
    it(`correctly builds a SchemaGraph from a Schema`, () => {
      const generator = new GraphGeneratorImpl({ orientation: 'horizontal' });

      const buildInputSchema = () => {
        const bookModel = schema.createDocumentModel({
          name: 'Book',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'books/{bookId}',
        });
        const reviewModel = schema.createDocumentModel({
          name: 'Review',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'books/{bookId}/reviews/{reviewId}',
        });
        const chapterModel = schema.createDocumentModel({
          name: 'Chapter',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'books/{bookId}/chapters/{chapterId}',
        });
        const translationModel = schema.createDocumentModel({
          name: 'Translation',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'books/{bookId}/translations/{translationId}',
        });
        return schema.createSchemaWithModels([bookModel, reviewModel, chapterModel, translationModel]);
      };

      const buildExpectedGraph = () => {
        const graph = new SchemaGraph();
        const booksCollection = graph.addRootCollection('books');
        const bookDocument = booksCollection.setGenericDocument('bookId');
        bookDocument.addSubCollection('reviews');
        bookDocument.addSubCollection('chapters');
        bookDocument.addSubCollection('translations');
        return graph;
      };

      const inputSchema = buildInputSchema();
      const expectedGraph = buildExpectedGraph();

      expect(generator.buildSchemaGraphFromSchema(inputSchema)).toEqual(expectedGraph);
    });
  });

  describe('buildMermaidGraph()', () => {
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
});
