import { getSchemaForTestDefinition } from '../../../../test/util/get-schema-for-test-definition';
import { createPythonGenerator } from '../PythonGeneratorImpl';

describe('PythonGeneratorImpl', () => {
  it('generates the correct output for flat schema', async () => {
    const generator = createPythonGenerator({
      indentation: 4,
      platform: 'py:firebase-admin:6',
    });
    const schema = getSchemaForTestDefinition('flat');
    const output = await generator.generate(schema);
    expect(output.toString()).toMatchSnapshot();
  });
});
