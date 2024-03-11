import { resolve } from 'path';

import { createDefinitionParser } from '../../../core/definition-parser';
import { createPythonGenerator } from '../PythonGeneratorImpl';

describe('PythonGeneratorImpl', () => {
  function getSchemaFor(definitionName: string) {
    const parser = createDefinitionParser();
    const pathToDefinition = resolve(__dirname, `definitions/${definitionName}.yml`);
    return parser.parseDefinition(pathToDefinition);
  }

  it('generates the correct output for flat schema', async () => {
    const generator = createPythonGenerator({
      indentation: 4,
      platform: 'py:firebase-admin:6',
    });
    const schema = getSchemaFor('flat');
    const output = await generator.generate(schema);
    expect(output.toString()).toMatchSnapshot();
  });
});
