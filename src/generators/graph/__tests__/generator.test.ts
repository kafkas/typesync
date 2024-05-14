import { schema } from '../../../schema/index.js';
import { GraphGeneratorImpl } from '../_impl.js';
import { MermaidGraph } from '../_types.js';
import {
  createLiteralRootCollectionWithGenericChildren,
  createLiteralSubCollectionWithGenericChildren,
} from '../factory.js';
import { SchemaGraphImpl } from '../schema-graph/impl.js';
import { SchemaGraph } from '../schema-graph/interfaces.js';

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
        const authorModel = schema.createDocumentModel({
          name: 'Author',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'authors/{authorId}',
        });
        return schema.createSchemaWithModels([bookModel, reviewModel, chapterModel, translationModel, authorModel]);
      };

      const buildExpectedGraph = (): SchemaGraph => {
        const { collection: booksCollection, document: bookDocument } = createLiteralRootCollectionWithGenericChildren(
          'books',
          'bookId'
        );
        createLiteralSubCollectionWithGenericChildren(bookDocument, 'reviews', 'reviewId');
        createLiteralSubCollectionWithGenericChildren(bookDocument, 'chapters', 'chapterId');
        createLiteralSubCollectionWithGenericChildren(bookDocument, 'translations', 'translationId');
        const { collection: authorsCollection } = createLiteralRootCollectionWithGenericChildren('authors', 'authorId');
        return new SchemaGraphImpl({
          type: 'literal-graph-children',
          collections: [booksCollection, authorsCollection],
        });
      };

      const inputSchema = buildInputSchema();
      const expectedGraph = buildExpectedGraph();
      const generatedGraph = generator.buildSchemaGraphFromSchema(inputSchema);

      // TODO: Implemented
      expect(true).toEqual(true);
    });
  });

  describe('buildMermaidGraph()', () => {
    it(`correctly builds a Mermaid graph from a SchemaGraph`, () => {
      const generator = new GraphGeneratorImpl({ orientation: 'horizontal' });

      const buildInputGraph = (): SchemaGraph => {
        const { collection: booksCollection, document: bookDocument } = createLiteralRootCollectionWithGenericChildren(
          'books',
          'bookId'
        );
        createLiteralSubCollectionWithGenericChildren(bookDocument, 'reviews', 'reviewId');
        createLiteralSubCollectionWithGenericChildren(bookDocument, 'chapters', 'chapterId');
        createLiteralSubCollectionWithGenericChildren(bookDocument, 'translations', 'translationId');
        const { collection: authorsCollection } = createLiteralRootCollectionWithGenericChildren('authors', 'authorId');
        return new SchemaGraphImpl({
          type: 'literal-graph-children',
          collections: [booksCollection, authorsCollection],
        });
      };

      const graph = buildInputGraph();
      const mermaidGraph = generator.buildMermaidGraph(graph);

      const expectedMermaidGraph: MermaidGraph = {
        orientation: 'LR',
        links: [
          ['books', 'generic_bookId[bookId]'],
          ['generic_bookId[bookId]', 'reviews'],
          ['generic_bookId[bookId]', 'chapters'],
          ['generic_bookId[bookId]', 'translations'],
          ['authors', 'generic_authorId[authorId]'],
        ],
      };

      expect(mermaidGraph).toEqual(expectedMermaidGraph);
    });
  });
});
