import { MermaidGraph } from '../mermaid-graph.js';

describe('MermaidGraph', () => {
  describe('equals()', () => {
    it(`correctly determines if two graphs are equal`, () => {
      const buildGraph1 = () => {
        const graph = new MermaidGraph('LR');
        const booksCol = graph.createNode('books');
        const bookDoc = graph.createNode('{bookId}');
        const reviewsCol = graph.createNode('reviews');
        const reviewDoc = graph.createNode('{reviewId}');
        const authorsCol = graph.createNode('authors');
        const authorDoc = graph.createNode('{authorId}');
        graph.link(booksCol, bookDoc);
        graph.link(bookDoc, reviewsCol);
        graph.link(reviewsCol, reviewDoc);
        graph.link(authorsCol, authorDoc);
        return graph;
      };

      const buildGraph2 = () => {
        const graph = new MermaidGraph('LR');
        const booksCol = graph.createNode('books');
        const bookDoc = graph.createNode('{bookId}');
        const reviewsCol = graph.createNode('reviews');
        const reviewDoc = graph.createNode('{reviewId}');
        const authorsCol = graph.createNode('authors');
        const authorDoc = graph.createNode('{authorId}');
        graph.link(booksCol, bookDoc);
        graph.link(bookDoc, reviewsCol);
        graph.link(reviewsCol, reviewDoc);
        graph.link(authorsCol, authorDoc);
        return graph;
      };

      expect(buildGraph1().equals(buildGraph2())).toBe(true);
    });
  });
});
