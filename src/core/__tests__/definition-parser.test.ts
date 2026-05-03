import { globSync } from 'glob';
import { resolve } from 'node:path';

import { getDirName } from '../../util/fs.js';
import { createDefinitionParser } from '../definition-parser/index.js';

const definitionsDir = resolve(getDirName(import.meta.url), 'definitions');

function findDefinitionFiles(globPattern: string) {
  return globSync(resolve(definitionsDir, globPattern));
}

function toJsonSnapshot(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

describe('DefinitionParserImpl', () => {
  it('aggregates models from multiple YAML files into a single definition', async () => {
    const parser = createDefinitionParser();
    const definition = parser.parseDefinition(findDefinitionFiles('yaml/*.yml'));
    await expect(toJsonSnapshot(definition)).toMatchFileSnapshot('./__file_snapshots__/parsed-definition.json');
  });

  it('parses JSON definition files into the same canonical structure as YAML files', () => {
    const parser = createDefinitionParser();
    const fromYaml = parser.parseDefinition(findDefinitionFiles('yaml/*.yml'));
    const fromJson = parser.parseDefinition(findDefinitionFiles('json/*.json'));
    expect(fromJson).toEqual(fromYaml);
  });

  it(`ignores the '$schema' field commonly used to associate definition files with a JSON schema`, () => {
    const parser = createDefinitionParser();
    const definition = parser.parseDefinition(findDefinitionFiles('with-$schema-key.json'));
    expect(definition).toEqual({
      Username: { model: 'alias', type: 'string' },
    });
  });

  it('throws when a definition file contains an unrecognized top-level field', () => {
    const parser = createDefinitionParser();
    expect(() => parser.parseDefinition(findDefinitionFiles('bad-field.json'))).toThrow();
  });

  it('throws when the same model name is defined in more than one file', () => {
    const parser = createDefinitionParser();
    expect(() => parser.parseDefinition(findDefinitionFiles('duplicate-models/*.json'))).toThrow();
  });
});
