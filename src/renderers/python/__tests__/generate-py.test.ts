import { PythonGeneration } from '../../../generators/python/index.js';
import { createPythonRenderer } from '../_impl.js';

describe('PythonRendererImpl', () => {
  it('correctly renders a Python generation', async () => {
    const renderer = createPythonRenderer({
      indentation: 4,
      target: 'firebase-admin@6',
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
          modelDocs: 'A string that uniquely identifies the user.',
        },
        {
          type: 'alias',
          modelName: 'UserMetadata',
          modelType: {
            type: 'any',
          },
          modelDocs: undefined,
        },
        {
          type: 'pydantic-class',
          modelName: 'Project',
          modelType: {
            type: 'object-class',
            attributes: [
              {
                type: { type: 'str' },
                name: 'name',
                optional: false,
                docs: undefined,
              },
              {
                type: { type: 'bool' },
                name: 'completed',
                optional: false,
                docs: 'Whether the project is completed.',
              },
            ],
            additionalAttributes: false,
          },
          modelDocs: 'A project within a workspace',
        },
      ],
    };

    const result = await renderer.render(generation);

    expect(result).toMatchSnapshot();
  });

  it('extends from custom base class if `customPydanticBase` is provided', async () => {
    const renderer = createPythonRenderer({
      indentation: 2,
      target: 'firebase-admin@6',
      customPydanticBase: {
        importPath: 'x.y',
        className: 'CustomModel',
      },
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
          modelDocs: undefined,
        },
      ],
    };

    const result = await renderer.render(generation);

    expect(result).toMatchSnapshot();
  });
});
