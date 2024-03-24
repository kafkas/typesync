import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema.js';
import { createPythonGenerator } from '../_impl.js';

describe('PythonGeneratorImpl', () => {
  it('produces the correct generation for a flat schema', async () => {
    const generator = createPythonGenerator({
      platform: 'py:firebase-admin:6',
    });
    const schema = loadSchemaForTestDefinition('flat');
    const generation = generator.generate(schema);
    expect(generation).toMatchSnapshot();
  });
});
