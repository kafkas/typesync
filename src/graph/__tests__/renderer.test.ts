import { renderMermaidGraph } from '../renderer.js';
import { MermaidGraph } from '../types.js';

describe('graph', () => {
  it(`renders graph correctly`, () => {
    const graph: MermaidGraph = {
      orientation: 'LR',
      links: [
        ['books', 'generic_bookId[bookId]'],
        ['generic_bookId[bookId]', 'reviews'],
        ['generic_bookId[bookId]', 'chapters'],
        ['generic_bookId[bookId]', 'translations'],
      ],
    };
    const renderedGraph = renderMermaidGraph(graph);
    expect(renderedGraph).toMatchSnapshot();
  });
});
