import type { TSGenerationTarget } from '../../../api/index.js';
import type { TSGeneration } from '../../../generators/ts/index.js';
import { createTSRenderer } from '../_impl.js';

function createRenderer(overrides: { indentation?: number; target?: TSGenerationTarget } = {}) {
  return createTSRenderer({
    indentation: overrides.indentation ?? 2,
    target: overrides.target ?? 'firebase-admin@13',
  });
}

describe('TSRendererImpl', () => {
  it('renders alias declarations covering every type expression with model docs', async () => {
    const generation: TSGeneration = {
      type: 'ts',
      declarations: [
        {
          type: 'alias',
          modelName: 'Username',
          modelType: { type: 'string' },
          modelDocs: 'A string that uniquely identifies a user.',
        },
        { type: 'alias', modelName: 'AnyValue', modelType: { type: 'any' }, modelDocs: null },
        { type: 'alias', modelName: 'UnknownValue', modelType: { type: 'unknown' }, modelDocs: null },
        { type: 'alias', modelName: 'Empty', modelType: { type: 'null' }, modelDocs: null },
        { type: 'alias', modelName: 'Active', modelType: { type: 'boolean' }, modelDocs: null },
        { type: 'alias', modelName: 'Age', modelType: { type: 'number' }, modelDocs: null },
        { type: 'alias', modelName: 'CreatedAt', modelType: { type: 'timestamp' }, modelDocs: null },
        { type: 'alias', modelName: 'TheAnswer', modelType: { type: 'literal', value: 42 }, modelDocs: null },
        {
          type: 'alias',
          modelName: 'Color',
          modelType: {
            type: 'enum',
            members: [
              { label: 'Red', value: 'red' },
              { label: 'Blue', value: 'blue' },
            ],
          },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'Coords',
          modelType: { type: 'tuple', elements: [{ type: 'number' }, { type: 'number' }] },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'Tags',
          modelType: { type: 'list', elementType: { type: 'string' } },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'Lookup',
          modelType: { type: 'record', valueType: { type: 'number' } },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'StringOrNumber',
          modelType: { type: 'union', variants: [{ type: 'string' }, { type: 'number' }] },
          modelDocs: null,
        },
        {
          type: 'alias',
          modelName: 'Profile',
          modelType: { type: 'alias', name: 'Username' },
          modelDocs: null,
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/all-type-expressions.ts');
  });

  it('renders an interface declaration with optional fields, field docs, and an index signature for additional properties', async () => {
    const generation: TSGeneration = {
      type: 'ts',
      declarations: [
        {
          type: 'interface',
          modelName: 'Profile',
          modelDocs: 'A user profile',
          modelType: {
            type: 'object',
            additionalProperties: true,
            properties: [
              { name: 'id', type: { type: 'string' }, optional: false, docs: 'The profile ID' },
              { name: 'bio', type: { type: 'string' }, optional: true, docs: null },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/interface-declaration.ts');
  });

  it('renders objects as type aliases when the generation produces an alias declaration with an object type', async () => {
    const generation: TSGeneration = {
      type: 'ts',
      declarations: [
        {
          type: 'alias',
          modelName: 'Profile',
          modelDocs: null,
          modelType: {
            type: 'object',
            additionalProperties: false,
            properties: [{ name: 'id', type: { type: 'string' }, optional: false, docs: null }],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/object-as-type-alias.ts');
  });

  it('respects the configured indentation', async () => {
    const generation: TSGeneration = {
      type: 'ts',
      declarations: [
        {
          type: 'interface',
          modelName: 'Profile',
          modelDocs: null,
          modelType: {
            type: 'object',
            additionalProperties: false,
            properties: [{ name: 'id', type: { type: 'string' }, optional: false, docs: null }],
          },
        },
      ],
    };

    const result = await createRenderer({ indentation: 4 }).render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/indentation-4.ts');
  });

  it('uses the correct firestore import for each target group', async () => {
    // Prettier normalizes the imports to single quotes.
    const targetsByExpectedImport: Record<string, TSGenerationTarget[]> = {
      [`import type * as firestore from 'firebase-admin/firestore';`]: ['firebase-admin@13', 'firebase-admin@12'],
      [`import type { firestore } from 'firebase-admin';`]: ['firebase-admin@11', 'firebase-admin@10'],
      [`import type * as firestore from 'firebase/firestore';`]: ['firebase@11', 'firebase@10', 'firebase@9'],
      [`import type * as firestore from '@react-native-firebase/firestore';`]: [
        'react-native-firebase@21',
        'react-native-firebase@20',
        'react-native-firebase@19',
      ],
    };

    for (const [expectedImport, targets] of Object.entries(targetsByExpectedImport)) {
      for (const target of targets) {
        const result = await createRenderer({ target }).render({ type: 'ts', declarations: [] });
        expect(result.content.split('\n')[0]).toBe(expectedImport);
      }
    }
  });
});
