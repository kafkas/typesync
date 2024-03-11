import { resolve } from 'path';

import { createDefinitionParser } from '../../../core/definition-parser';
import { createTSGenerator } from '../TSGeneratorImpl';

describe('TSGeneratorImpl', () => {
  function getSchemaFor(definitionName: string) {
    const parser = createDefinitionParser();
    const pathToDefinition = resolve(__dirname, `definitions/${definitionName}.yml`);
    return parser.parseDefinition(pathToDefinition);
  }

  it('generates the correct output for flat schema', async () => {
    const generator = createTSGenerator({
      indentation: 4,
      platform: 'ts:firebase-admin:11',
    });
    const schema = getSchemaFor('flat');
    const output = await generator.generate(schema);
    expect(output.toString()).toMatchSnapshot();
  });
});
