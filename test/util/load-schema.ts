import { resolve } from 'path';

import { createDefinitionParser } from '../../src/core/definition-parser';

export function loadSchemaForTestDefinition(definitionName: string) {
  const pathToDefinition = resolve(__dirname, `../definitions/${definitionName}.yml`);
  return loadSchemaForDefinition(pathToDefinition);
}

export function loadSchemaForDefinition(pathToDefinition: string) {
  const parser = createDefinitionParser();
  return parser.parseDefinition(pathToDefinition);
}
