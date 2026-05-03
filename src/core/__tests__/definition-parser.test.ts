import { globSync } from 'glob';
import { resolve } from 'path';

import { getDirName } from '../../util/fs.js';
import { createDefinitionParser } from '../definition-parser/index.js';

function toJsonSnapshot(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

describe('definition-parser', () => {
  it('correctly parses definition from YAML files', async () => {
    const parser = createDefinitionParser();
    const definitionGlobPattern = resolve(getDirName(import.meta.url), `./definitions/yaml/*.yml`);
    const filePaths = globSync(definitionGlobPattern);
    const definition = parser.parseDefinition(filePaths);
    await expect(toJsonSnapshot(definition)).toMatchFileSnapshot('./__file_snapshots__/definition-from-yaml.json');
  });

  it('correctly parses definition from JSON files', async () => {
    const parser = createDefinitionParser();
    const definitionGlobPattern = resolve(getDirName(import.meta.url), `./definitions/json/*.json`);
    const filePaths = globSync(definitionGlobPattern);
    const definition = parser.parseDefinition(filePaths);
    await expect(toJsonSnapshot(definition)).toMatchFileSnapshot('./__file_snapshots__/definition-from-json.json');
  });

  it(`ignores the '$schema' field in definition files`, async () => {
    const parser = createDefinitionParser();
    const definitionGlobPattern = resolve(getDirName(import.meta.url), `./definitions/with-$schema-key.json`);
    const filePaths = globSync(definitionGlobPattern);
    const definition = parser.parseDefinition(filePaths);
    await expect(toJsonSnapshot(definition)).toMatchFileSnapshot(
      './__file_snapshots__/definition-with-schema-key.json'
    );
  });

  it(`throws if the file contains an incorrect field`, () => {
    const parser = createDefinitionParser();
    const definitionGlobPattern = resolve(getDirName(import.meta.url), `./definitions/bad-field.json`);
    const filePaths = globSync(definitionGlobPattern);
    expect(() => parser.parseDefinition(filePaths)).toThrow();
  });
});
