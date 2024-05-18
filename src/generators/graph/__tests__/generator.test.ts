import { schema } from '../../../schema/index.js';
import { GraphGeneratorImpl } from '../_impl.js';
import {
  createLiteralRootCollectionWithGenericChildren,
  createLiteralSubCollectionWithGenericChildren,
} from '../factory.js';
import { MermaidGraph } from '../mermaid-graph.js';
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

      // TODO: Implement
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

      const buildExpectedMermaidGraph = () => {
        const graph = new MermaidGraph('LR');
        const booksCol = graph.createNode('books');
        const bookDoc = graph.createNode('{bookId}');
        const reviewsCol = graph.createNode('reviews');
        const chaptersCol = graph.createNode('chapters');
        const translationsCol = graph.createNode('translations');
        const authorsCol = graph.createNode('authors');
        const authorDoc = graph.createNode('{authorId}');

        graph.link(booksCol, bookDoc);
        graph.link(bookDoc, reviewsCol);
        graph.link(bookDoc, chaptersCol);
        graph.link(bookDoc, translationsCol);
        graph.link(authorsCol, authorDoc);

        return graph;
      };

      const graph = buildInputGraph();
      const mermaidGraph = generator.buildMermaidGraph(graph);
      const expectedMermaidGraph = buildExpectedMermaidGraph();
      expect(mermaidGraph.equals(expectedMermaidGraph)).toBe(true);
    });
  });
});
