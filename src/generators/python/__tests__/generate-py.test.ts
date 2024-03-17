import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema';
import { createPythonGenerator } from '../PythonGeneratorImpl';

describe('PythonGeneratorImpl', () => {
  it('produces the correct generation for a flat schema', async () => {
    const generator = createPythonGenerator({
      indentation: 4,
      platform: 'py:firebase-admin:6',
    });
    const schema = loadSchemaForTestDefinition('flat');
    const generation = generator.generate(schema);
    expect(generation).toMatchSnapshot();
  });
});
