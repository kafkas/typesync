import { PythonGeneration } from '../../../generators/python/index.js';
import { createPythonRenderer } from '../_impl.js';

describe('PythonRendererImpl', () => {
  it('correctly renders a Python generation', async () => {
    const renderer = createPythonRenderer({
      indentation: 4,
      platform: 'py:firebase-admin:6',
    });

    const generation: PythonGeneration = {
      type: 'python',
      declarations: [
        {
          type: 'alias',
          modelName: 'Username',
          modelType: {
            type: 'str',
          },
        },
        {
          type: 'pydantic-class',
          modelName: 'Dog',
          modelType: {
            type: 'object-class',
            attributes: [
              { type: { type: 'str' }, name: 'name', optional: false, docs: undefined },
              { type: { type: 'str' }, name: 'breed', optional: false, docs: undefined },
            ],
          },
          modelDocs: undefined,
        },
      ],
    };

    const result = await renderer.render(generation);

    expect(result).toMatchSnapshot();
  });
});
