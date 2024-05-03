import { TSGeneration } from '../../../generators/ts/index.js';
import { createTSRenderer } from '../_impl.js';

describe('TSRendererImpl', () => {
  it('correctly renders a TS generation', async () => {
    const renderer = createTSRenderer({
      indentation: 4,
      platform: 'firebase-admin@11',
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
          modelDocs: undefined,
        },
        {
          type: 'alias',
          modelName: 'UserMetadata',
          modelType: {
            type: 'unknown',
          },
          modelDocs: undefined,
        },
        {
          type: 'interface',
          modelName: 'Dog',
          modelType: {
            type: 'object',
            properties: [
              { type: { type: 'string' }, name: 'name', docs: undefined, optional: false },
              { type: { type: 'string' }, name: 'breed', docs: undefined, optional: false },
            ],
            additionalProperties: false,
          },
          modelDocs: undefined,
        },
      ],
    };

    const result = await renderer.render(generation);

    expect(result).toMatchSnapshot();
  });
});
