import { createSchemaGraph } from '../../../schema-graph/index.js';
import { GraphGeneratorImpl, createGraphGenerator } from '../_impl.js';
import { MermaidGraph } from '../mermaid-graph.js';

describe('GraphGeneratorImpl', () => {
  describe('orientation', () => {
    it(`uses an 'LR' Mermaid orientation when configured as 'horizontal'`, () => {
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
                document: { type: 'generic-document', genericId: 'authorId', children: null },
              },
            },
          ],
        },
      });
      const result = generator.buildMermaidGraphFromSchemaGraph(inputGraph);
      expect(result.orientation).toBe('LR');
    });

    it(`uses a 'TB' Mermaid orientation when configured as 'vertical'`, () => {
      const generator = new GraphGeneratorImpl({ orientation: 'vertical' });
      const inputGraph = createSchemaGraph({
        root: {
          type: 'literal',
          collections: [
            {
              type: 'literal',
              id: 'authors',
              children: {
                type: 'generic',
                document: { type: 'generic-document', genericId: 'authorId', children: null },
              },
            },
          ],
        },
      });
      const result = generator.buildMermaidGraphFromSchemaGraph(inputGraph);
      expect(result.orientation).toBe('TB');
    });
  });

  describe('buildMermaidGraphFromSchemaGraph()', () => {
    it('builds a node and link for a single root collection containing a generic document', () => {
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
                document: { type: 'generic-document', genericId: 'authorId', children: null },
              },
            },
          ],
        },
      });

      const expected = (() => {
        const g = new MermaidGraph('LR');
        const col = g.createNode('authors');
        const doc = g.createNode('{authorId}');
        g.link(col, doc);
        return g;
      })();

      expect(generator.buildMermaidGraphFromSchemaGraph(inputGraph).equals(expected)).toBe(true);
    });

    it('builds a node and link for a generic root collection', () => {
      const generator = new GraphGeneratorImpl({ orientation: 'horizontal' });
      const inputGraph = createSchemaGraph({
        root: {
          type: 'generic',
          collection: {
            type: 'generic',
            genericId: 'tenantId',
            children: { type: 'generic', document: { type: 'generic-document', genericId: 'docId', children: null } },
          },
        },
      });

      const expected = (() => {
        const g = new MermaidGraph('LR');
        const col = g.createNode('{tenantId}');
        const doc = g.createNode('{docId}');
        g.link(col, doc);
        return g;
      })();

      expect(generator.buildMermaidGraphFromSchemaGraph(inputGraph).equals(expected)).toBe(true);
    });

    it('recursively builds nodes for nested subcollections under a document', () => {
      const generator = new GraphGeneratorImpl({ orientation: 'horizontal' });
      const inputGraph = createSchemaGraph({
        root: {
          type: 'literal',
          collections: [
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
                    ],
                  },
                },
              },
            },
          ],
        },
      });

      const expected = (() => {
        const g = new MermaidGraph('LR');
        const booksCol = g.createNode('books');
        const bookDoc = g.createNode('{bookId}');
        const chaptersCol = g.createNode('chapters');
        const chapterDoc = g.createNode('{chapterId}');
        g.link(booksCol, bookDoc);
        g.link(bookDoc, chaptersCol);
        g.link(chaptersCol, chapterDoc);
        return g;
      })();

      expect(generator.buildMermaidGraphFromSchemaGraph(inputGraph).equals(expected)).toBe(true);
    });

    it('builds nodes for multiple root collections each with their own document subtree', () => {
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
                document: { type: 'generic-document', genericId: 'authorId', children: null },
              },
            },
            {
              type: 'literal',
              id: 'books',
              children: {
                type: 'generic',
                document: { type: 'generic-document', genericId: 'bookId', children: null },
              },
            },
          ],
        },
      });

      const expected = (() => {
        const g = new MermaidGraph('LR');
        const authorsCol = g.createNode('authors');
        const authorDoc = g.createNode('{authorId}');
        const booksCol = g.createNode('books');
        const bookDoc = g.createNode('{bookId}');
        g.link(authorsCol, authorDoc);
        g.link(booksCol, bookDoc);
        return g;
      })();

      expect(generator.buildMermaidGraphFromSchemaGraph(inputGraph).equals(expected)).toBe(true);
    });
  });

  describe('generate()', () => {
    it('returns a graph generation containing the built mermaid graph', () => {
      const generator = createGraphGenerator({ orientation: 'horizontal' });
      const inputGraph = createSchemaGraph({
        root: {
          type: 'literal',
          collections: [
            {
              type: 'literal',
              id: 'authors',
              children: {
                type: 'generic',
                document: { type: 'generic-document', genericId: 'authorId', children: null },
              },
            },
          ],
        },
      });

      const generation = generator.generate(inputGraph);

      expect(generation.type).toBe('graph');
      expect(generation.graph).toBeInstanceOf(MermaidGraph);
      expect(generation.graph.orientation).toBe('LR');
    });
  });
});
