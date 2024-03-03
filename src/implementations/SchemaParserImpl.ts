import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import type { Logger, SchemaParser } from '../interfaces';
import { extractErrorMessage } from '../util/extract-error-message';
import { SchemaNotValidYamlError } from '../errors';
import { createSchema } from './SchemaImpl';

class SchemaParserImpl implements SchemaParser {
  public constructor(private readonly logger: Logger) {}

  public parseSchema(pathToSchema: string) {
    const parsed = this.parseSchemaYaml(pathToSchema);
    this.logger.info('Parse Result:', parsed);
    return createSchema();
  }

  private parseSchemaYaml(pathToSchema: string): unknown {
    try {
      const schemaYamlContent = readFileSync(pathToSchema).toString();
      return parseYaml(schemaYamlContent, { strict: true });
    } catch (e) {
      this.logger.error(extractErrorMessage(e));
      throw new SchemaNotValidYamlError(pathToSchema);
    }
  }
}

export function createSchemaParser(logger: Logger): SchemaParser {
  return new SchemaParserImpl(logger);
}
