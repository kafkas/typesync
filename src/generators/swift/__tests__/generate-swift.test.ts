import { schema } from '../../../schema/index.js';
import { createSwiftGenerator } from '../_impl.js';
import { SwiftGeneration } from '../_types.js';

describe('SwiftGeneratorImpl', () => {
  it('produces the correct generation for a flat schema', async () => {
    const generator = createSwiftGenerator({
      platform: 'swift:firebase:10',
    });
    const s = schema.createFromDefinition({
      Username: {
        model: 'alias',
        type: 'string',
        docs: 'A string that uniquely identifies the user.',
      },
      UserRole: {
        model: 'alias',
        type: {
          type: 'enum',
          members: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
          ],
        },
      },
      Project: {
        model: 'document',
        type: {
          type: 'object',
          fields: {
            id: {
              type: 'string',
              docs: 'The ID of the project',
            },
            completed: {
              type: 'boolean',
              docs: 'Whether the project is completed',
            },
          },
        },
        docs: 'Represents a project within a workspace',
      },
    });
    const generation = generator.generate(s);

    const expectedGeneration: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'typealias',
          modelName: 'Username',
          modelType: { type: 'string' },
          modelDocs: 'A string that uniquely identifies the user.',
        },
        {
          type: 'string-enum',
          modelName: 'UserRole',
          modelType: {
            type: 'string-enum',
            cases: [
              { key: 'Admin', value: 'admin' },
              { key: 'User', value: 'user' },
            ],
          },
          modelDocs: undefined,
        },
        {
          type: 'struct',
          modelName: 'Project',
          modelType: {
            type: 'struct',
            literalProperties: [],
            regularProperties: [
              {
                originalName: 'id',
                docs: 'The ID of the project',
                optional: false,
                type: { type: 'string' },
              },
              {
                originalName: 'completed',
                docs: 'Whether the project is completed',
                optional: false,
                type: { type: 'bool' },
              },
            ],
          },
          modelDocs: 'Represents a project within a workspace',
        },
      ],
    };

    expect(generation).toEqual(expectedGeneration);
  });
});
