import { createSchemaGraph } from '../../../schema-graph/index.js';
import { GraphGeneratorImpl } from '../_impl.js';
import { MermaidGraph } from '../mermaid-graph.js';

describe('GraphGeneratorImpl', () => {
  describe('buildMermaidGraphFromSchemaGraph()', () => {
    it(`correctly builds a Mermaid graph from a SchemaGraph`, () => {
      const generator = new GraphGeneratorImpl({ orientation: 'horizontal' });

      const inputGraph = createSchemaGraph({
        root: {
          type: 'literal',
          collections: [
            {
              type: 'literal',
              id: 'authors',
              children: {
                type: 'generic',
                document: {
                  type: 'generic-document',
                  genericId: 'authorId',
                  children: null,
                },
              },
            },
            {
              type: 'literal',
              id: 'books',
              children: {
                type: 'generic',
                document: {
                  type: 'generic-document',
                  genericId: 'bookId',
                  children: {
                    type: 'literal',
                    collections: [
                      {
                        type: 'literal',
                        id: 'chapters',
                        children: {
                          type: 'generic',
                          document: { type: 'generic-document', genericId: 'chapterId', children: null },
                        },
                      },
                      {
                        type: 'literal',
                        id: 'reviews',
                        children: {
                          type: 'generic',
                          document: { type: 'generic-document', genericId: 'reviewId', children: null },
                        },
                      },
                      {
                        type: 'literal',
                        id: 'translations',
                        children: {
                          type: 'generic',
                          document: { type: 'generic-document', genericId: 'translationId', children: null },
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      });

      const buildExpectedMermaidGraph = () => {
        const graph = new MermaidGraph('LR');
        const authorsCol = graph.createNode('authors');
        const authorDoc = graph.createNode('{authorId}');
        const booksCol = graph.createNode('books');
        const bookDoc = graph.createNode('{bookId}');
        const chaptersCol = graph.createNode('chapters');
        const chapterDoc = graph.createNode('{chapterId}');
        const reviewsCol = graph.createNode('reviews');
        const reviewDoc = graph.createNode('{reviewId}');
        const translationsCol = graph.createNode('translations');
        const translationDoc = graph.createNode('{translationId}');

        graph.link(booksCol, bookDoc);
        graph.link(bookDoc, chaptersCol);
        graph.link(chaptersCol, chapterDoc);
        graph.link(bookDoc, reviewsCol);
        graph.link(reviewsCol, reviewDoc);
        graph.link(bookDoc, translationsCol);
        graph.link(translationsCol, translationDoc);
        graph.link(authorsCol, authorDoc);

        return graph;
      };

      const builtMermaidGraph = generator.buildMermaidGraphFromSchemaGraph(inputGraph);
      const expectedMermaidGraph = buildExpectedMermaidGraph();

      expect(builtMermaidGraph.equals(expectedMermaidGraph)).toBe(true);
    });
  });
});
