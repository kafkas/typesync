import { globSync } from 'glob';
import { resolve } from 'path';

import { getDirName } from '../../util/fs.js';
import { createDefinitionParser } from '../definition-parser.js';

describe('definition-parser', () => {
  it('correctly parses definition from YAML files', () => {
    const parser = createDefinitionParser();
    const definitionGlobPattern = resolve(getDirName(import.meta.url), `./definitions/yaml/*.yml`);
    const filePaths = globSync(definitionGlobPattern);
    const definition = parser.parseDefinition(filePaths);
    expect(definition).toMatchSnapshot();
  });

  it('correctly parses definition from JSON files', () => {
    const parser = createDefinitionParser();
    const definitionGlobPattern = resolve(getDirName(import.meta.url), `./definitions/json/*.json`);
    const filePaths = globSync(definitionGlobPattern);
    const definition = parser.parseDefinition(filePaths);
    expect(definition).toMatchSnapshot();
  });
});
