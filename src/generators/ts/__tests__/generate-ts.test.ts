import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema';
import { createTSGenerator } from '../TSGeneratorImpl';

describe('TSGeneratorImpl', () => {
  it('produces the correct generation for a flat schema', async () => {
    const generator = createTSGenerator({
      indentation: 4,
      platform: 'ts:firebase-admin:11',
    });
    const schema = loadSchemaForTestDefinition('flat');
    const generation = generator.generate(schema);
    expect(generation).toMatchSnapshot();
  });
});
