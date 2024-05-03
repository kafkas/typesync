import { schema } from '../../../schema/index.js';
import { createTSGenerator } from '../_impl.js';
import { TSGeneration } from '../_types.js';

describe('TSGeneratorImpl', () => {
  it('produces the correct generation for a flat schema', async () => {
    const generator = createTSGenerator({
      platform: 'firebase-admin@11',
    });
    const s = schema.createFromDefinition({
      Username: {
        model: 'alias',
        type: 'string',
        docs: 'A string that uniquely identifies a user.',
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
    });

    const generation = generator.generate(s);

    const expectedGeneration: TSGeneration = {
      type: 'ts',
      declarations: [
        {
          type: 'alias',
          modelName: 'Username',
          modelType: { type: 'string' },
          modelDocs: 'A string that uniquely identifies a user.',
        },
        {
          type: 'alias',
          modelName: 'UserRole',
          modelType: {
            type: 'enum',
            members: [
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
            ],
          },
          modelDocs: undefined,
        },
      ],
    };

    expect(generation).toEqual(expectedGeneration);
  });
});
