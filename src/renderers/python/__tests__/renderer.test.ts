import type { PythonGeneration } from '../../../generators/python/index.js';
import { createPythonRenderer } from '../_impl.js';
import type { CustomPydanticBase } from '../_types.js';

function createRenderer(
  overrides: { indentation?: number; undefinedSentinelName?: string; customPydanticBase?: CustomPydanticBase } = {}
) {
  return createPythonRenderer({
    indentation: overrides.indentation ?? 4,
    target: 'firebase-admin@6',
    undefinedSentinelName: overrides.undefinedSentinelName ?? 'UNDEFINED',
    customPydanticBase: overrides.customPydanticBase,
  });
}

describe('PythonRendererImpl', () => {
  it('renders alias declarations covering every type expression with model docs', async () => {
    const generation: PythonGeneration = {
      type: 'python',
      declarations: [
        {
          type: 'alias',
          modelName: 'Username',
          modelType: { type: 'str' },
          modelDocs: 'A string that uniquely identifies the user.',
        },
        { type: 'alias', modelName: 'AnyValue', modelType: { type: 'any' }, modelDocs: null },
        { type: 'alias', modelName: 'Empty', modelType: { type: 'none' }, modelDocs: null },
        { type: 'alias', modelName: 'Active', modelType: { type: 'bool' }, modelDocs: null },
        { type: 'alias', modelName: 'Age', modelType: { type: 'int' }, modelDocs: null },
        { type: 'alias', modelName: 'Pi', modelType: { type: 'float' }, modelDocs: null },
        { type: 'alias', modelName: 'CreatedAt', modelType: { type: 'datetime' }, modelDocs: null },
        { type: 'alias', modelName: 'TheAnswer', modelType: { type: 'literal', value: 42 }, modelDocs: null },
        {
          type: 'alias',
          modelName: 'Coords',
          modelType: { type: 'tuple', elements: [{ type: 'int' }, { type: 'int' }] },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'Tags',
          modelType: { type: 'list', elementType: { type: 'str' } },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'Lookup',
          modelType: { type: 'dict', valueType: { type: 'int' } },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'StringOrInt',
          modelType: { type: 'simple-union', variants: [{ type: 'str' }, { type: 'int' }] },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'PetRef',
          modelType: { type: 'alias', name: 'Username' },
          modelDocs: null,
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/all-type-expressions.py');
  });

  it('renders enum-class declarations with each member as a class attribute', async () => {
    const generation: PythonGeneration = {
      type: 'python',
      declarations: [
        {
          type: 'enum-class',
          modelName: 'Color',
          modelDocs: 'Available colors',
          modelType: {
            type: 'enum-class',
            attributes: [
              { key: 'Red', value: 'red' },
              { key: 'Blue', value: 'blue' },
            ],
          },
        },
        {
          type: 'enum-class',
          modelName: 'Priority',
          modelDocs: null,
          modelType: {
            type: 'enum-class',
            attributes: [
              { key: 'Low', value: 1 },
              { key: 'High', value: 2 },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/enum-class-declaration.py');
  });

  it('renders pydantic-class declarations with optional fields, field docs, and additionalAttributes Config flag', async () => {
    const generation: PythonGeneration = {
      type: 'python',
      declarations: [
        {
          type: 'pydantic-class',
          modelName: 'Profile',
          modelDocs: 'A user profile',
          modelType: {
            type: 'object-class',
            additionalAttributes: true,
            attributes: [
              { name: 'id', type: { type: 'str' }, optional: false, docs: 'The profile ID' },
              { name: 'bio', type: { type: 'str' }, optional: true, docs: null },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/pydantic-class-declaration.py');
  });

  it('uses the configured undefined sentinel name across the static declarations and optional field defaults', async () => {
    const generation: PythonGeneration = {
      type: 'python',
      declarations: [
        {
          type: 'pydantic-class',
          modelName: 'Profile',
          modelDocs: null,
          modelType: {
            type: 'object-class',
            additionalAttributes: false,
            attributes: [{ name: 'bio', type: { type: 'str' }, optional: true, docs: null }],
          },
        },
      ],
    };

    const result = await createRenderer({ undefinedSentinelName: 'UNSET' }).render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/custom-undefined-sentinel.py');
  });

  it('uses a custom Pydantic base class import and parent when customPydanticBase is provided', async () => {
    const generation: PythonGeneration = {
      type: 'python',
      declarations: [
        {
          type: 'pydantic-class',
          modelName: 'Profile',
          modelDocs: null,
          modelType: {
            type: 'object-class',
            additionalAttributes: false,
            attributes: [{ name: 'id', type: { type: 'str' }, optional: false, docs: null }],
          },
        },
      ],
    };

    const result = await createRenderer({
      indentation: 2,
      customPydanticBase: { importPath: 'x.y', className: 'CustomModel' },
    }).render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/custom-pydantic-base.py');
  });
});
