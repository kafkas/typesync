import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema';
import { createTSGenerator } from '../TSGeneratorImpl';

describe('TSGeneratorImpl', () => {
  it('generates the correct output for flat schema', async () => {
    const generator = createTSGenerator({
      indentation: 4,
      platform: 'ts:firebase-admin:11',
    });
    const schema = loadSchemaForTestDefinition('flat');
    const output = await generator.generate(schema);
    expect(output.toString()).toMatchSnapshot();
  });
});
