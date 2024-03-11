import { resolve } from 'path';

import { createDefinitionParser } from '../../src/core/definition-parser';

export function getSchemaForTestDefinition(definitionName: string) {
  const parser = createDefinitionParser();
  const pathToDefinition = resolve(__dirname, `../definitions/${definitionName}.yml`);
  return parser.parseDefinition(pathToDefinition);
}
