import { getSchemaForTestDefinition } from '../../../../test/util/get-schema-for-test-definition';
import { createTSGenerator } from '../TSGeneratorImpl';

describe('TSGeneratorImpl', () => {
  it('generates the correct output for flat schema', async () => {
    const generator = createTSGenerator({
      indentation: 4,
      platform: 'ts:firebase-admin:11',
    });
    const schema = getSchemaForTestDefinition('flat');
    const output = await generator.generate(schema);
    expect(output.toString()).toMatchSnapshot();
  });
});
