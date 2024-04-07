import { globSync } from 'glob';
import { resolve } from 'path';

import { getDirName } from '../../util/fs.js';
import { createDefinitionParser } from '../definition-parser.js';

describe('definition-parser', () => {
  it('correctly parses definition from a YAML file', () => {
    const parser = createDefinitionParser();
    const definitionGlobPattern = resolve(getDirName(import.meta.url), `./definitions/flat/*.yml`);
    const filePaths = globSync(definitionGlobPattern);
    const definition = parser.parseDefinition(filePaths);
    expect(definition).toMatchSnapshot();
  });
});
