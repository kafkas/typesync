import { TSGeneration } from '../../../generators/ts/index.js';
import { createTSRenderer } from '../_impl.js';

describe('TSRendererImpl', () => {
  it('correctly renders a TS generation', async () => {
    const renderer = createTSRenderer({
      indentation: 4,
      target: 'firebase-admin@11',
    });

    const generation: TSGeneration = {
      type: 'ts',
      declarations: [
        {
          type: 'alias',
          modelName: 'Username',
          modelType: {
            type: 'string',
          },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'UserMetadata',
          modelType: {
            type: 'unknown',
          },
          modelDocs: null,
        },
        {
          type: 'interface',
          modelName: 'Dog',
          modelType: {
            type: 'object',
            properties: [
              { type: { type: 'string' }, name: 'name', docs: null, optional: false },
              { type: { type: 'string' }, name: 'breed', docs: null, optional: false },
            ],
            additionalProperties: false,
          },
          modelDocs: null,
        },
      ],
    };

    const result = await renderer.render(generation);

    expect(result).toMatchSnapshot();
  });
});
