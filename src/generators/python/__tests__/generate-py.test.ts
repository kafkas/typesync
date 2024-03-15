import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema';
import { createPythonGenerator } from '../PythonGeneratorImpl';

describe('PythonGeneratorImpl', () => {
  it('generates the correct output for flat schema', async () => {
    const generator = createPythonGenerator({
      indentation: 4,
      platform: 'py:firebase-admin:6',
    });
    const schema = loadSchemaForTestDefinition('flat');
    const output = await generator.generate(schema);
    expect(output.toString()).toMatchSnapshot();
  });
});
