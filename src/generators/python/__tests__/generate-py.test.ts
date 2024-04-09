import { schema } from '../../../schema/index.js';
import { createPythonGenerator } from '../_impl.js';
import { PythonGeneration } from '../_types.js';

describe('PythonGeneratorImpl', () => {
  it('produces the correct generation for a flat schema', async () => {
    const generator = createPythonGenerator({
      platform: 'py:firebase-admin:6',
    });
    const s = schema.createFromDefinition({
      Username: {
        model: 'alias',
        type: 'string',
      },
      UserRole: {
        model: 'alias',
        type: {
          type: 'enum',
          items: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
          ],
        },
      },
    });
    const generation = generator.generate(s);

    const expectedGeneration: PythonGeneration = {
      type: 'python',
      declarations: [
        {
          type: 'alias',
          modelName: 'Username',
          modelType: { type: 'str' },
        },
        {
          type: 'enum-class',
          modelName: 'UserRole',
          modelType: {
            type: 'enum-class',
            attributes: [
              { key: 'Admin', value: 'admin' },
              { key: 'User', value: 'user' },
            ],
          },
        },
      ],
    };

    expect(generation).toEqual(expectedGeneration);
  });
});
