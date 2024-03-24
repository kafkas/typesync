import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema.js';
import { createTSGenerator } from '../_impl.js';

describe('TSGeneratorImpl', () => {
  it('produces the correct generation for a flat schema', async () => {
    const generator = createTSGenerator({
      platform: 'ts:firebase-admin:11',
    });
    const schema = loadSchemaForTestDefinition('flat');
    const generation = generator.generate(schema);
    expect(generation).toMatchSnapshot();
  });
});
