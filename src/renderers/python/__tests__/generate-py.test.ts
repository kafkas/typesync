import { PythonGeneration } from '../../../generators/python/index.js';
import { createPythonRenderer } from '../_impl.js';

describe('PythonRendererImpl', () => {
  it('correctly renders a Python generation', async () => {
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
              { type: { type: 'str' }, name: 'name' },
              { type: { type: 'str' }, name: 'breed' },
            ],
          },
        },
      ],
    };

    const renderer = createPythonRenderer({
      rootFileName: 'models.py',
      indentation: 4,
      platform: 'py:firebase-admin:6',
    });

    expect(renderer.render(generation)).toMatchSnapshot();
  });
});
