import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import type { SchemaParser } from '../interfaces';
import { extractErrorMessage } from '../util/extract-error-message';
import { SchemaNotValidYamlError } from '../errors';
import { createSchema } from './SchemaImpl';

class SchemaParserImpl implements SchemaParser {
  public parseSchema(pathToSchema: string) {
    const parsed = this.parseSchemaYaml(pathToSchema);
    console.log('Parse Result:', parsed);
    return createSchema();
  }

  private parseSchemaYaml(pathToSchema: string): unknown {
    try {
      const schemaYamlContent = readFileSync(pathToSchema).toString();
      return parseYaml(schemaYamlContent, { strict: true });
    } catch (e) {
      console.error(extractErrorMessage(e));
      throw new SchemaNotValidYamlError(pathToSchema);
    }
  }
}

export function createSchemaParser(): SchemaParser {
  return new SchemaParserImpl();
}
