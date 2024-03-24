import { resolve } from 'path';

import { createDefinitionParser } from '../../src/core/definition-parser.js';
import { schema } from '../../src/schema/index.js';
import { getDirName } from '../../src/util/fs.js';

export function loadSchemaForTestDefinition(definitionName: string) {
  const pathToDefinition = resolve(getDirName(import.meta.url), `../definitions/${definitionName}.yml`);
  return loadSchemaForDefinition(pathToDefinition);
}

export function loadSchemaForDefinition(pathToDefinition: string) {
  const parser = createDefinitionParser();
  const definition = parser.parseDefinition(pathToDefinition);
  return schema.createSchema(definition);
}
