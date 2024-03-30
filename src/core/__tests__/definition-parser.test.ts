import { resolve } from 'path';

import { getDirName } from '../../util/fs.js';
import { createDefinitionParser } from '../definition-parser.js';

describe('definition-parser', () => {
  it('correctly parses definition from a YAML file', () => {
    const parser = createDefinitionParser();
    const pathToDefinition = resolve(getDirName(import.meta.url), `./definitions/flat/definition.yml`);
    const definition = parser.parseDefinition(pathToDefinition);
    expect(definition).toMatchSnapshot();
  });
});
