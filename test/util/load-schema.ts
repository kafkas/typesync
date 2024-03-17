import { resolve } from 'path';

import { createDefinitionParser } from '../../src/core/definition-parser';
import { schema } from '../../src/schema';

export function loadSchemaForTestDefinition(definitionName: string) {
  const pathToDefinition = resolve(__dirname, `../definitions/${definitionName}.yml`);
  return loadSchemaForDefinition(pathToDefinition);
}

export function loadSchemaForDefinition(pathToDefinition: string) {
  const parser = createDefinitionParser();
  const definition = parser.parseDefinition(pathToDefinition);
  return schema.createSchema(definition);
}
