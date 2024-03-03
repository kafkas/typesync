import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { Schema } from './Schema';
import { extractErrorMessage } from '../util/extract-error-message';
import { SchemaNotValidYamlError } from '../errors';

export class SchemaParser {
  public parseSchema(pathToSchema: string): Schema {
    const parsed = this.parseSchemaYaml(pathToSchema);
    console.log('Parse Result:', parsed);
    return new Schema();
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
