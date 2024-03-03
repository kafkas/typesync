import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type { Logger, SchemaParser } from '../interfaces';
import { extractErrorMessage } from '../util/extract-error-message';
import { SchemaNotValidYamlError, SchemaNotValidError } from '../errors';
import { createSchema } from './SchemaImpl';

const fieldDefinitionSchema = z
  .object({
    type: z.enum(['string', 'boolean', 'int']),
    optional: z.boolean().optional(),
    docs: z.string().optional(),
  })
  .strict();

const modelSchema = z
  .object({
    docs: z.string().optional(),
    fields: z.record(fieldDefinitionSchema),
  })
  .strict();

const schemaFileSchema = z.record(modelSchema);

class SchemaParserImpl implements SchemaParser {
  public constructor(private readonly logger: Logger) {}

  public parseSchema(pathToSchema: string) {
    const fileContentAsJson = this.parseYamlFileToJson(pathToSchema);
    const parsedSchemaFile = this.parseSchemaYamlContentJson(fileContentAsJson);
    return createSchema(parsedSchemaFile);
  }

  private parseYamlFileToJson(pathToSchema: string): unknown {
    try {
      const schemaYamlContent = readFileSync(pathToSchema).toString();
      return parseYaml(schemaYamlContent, { strict: true });
    } catch (e) {
      this.logger.error(extractErrorMessage(e));
      throw new SchemaNotValidYamlError(pathToSchema);
    }
  }

  private parseSchemaYamlContentJson(contentJson: unknown) {
    const parseRes = schemaFileSchema.safeParse(contentJson);

    if (!parseRes.success) {
      const { error } = parseRes;
      const issue = error.issues[0];
      if (issue) {
        const { message } = issue;
        const path = issue.path.join('.');
        throw new SchemaNotValidError(path, message);
      } else {
        throw new SchemaNotValidError('unknown', 'An unexpected invalid value.');
      }
    }

    return parseRes.data;
  }
}

export function createSchemaParser(logger: Logger): SchemaParser {
  return new SchemaParserImpl(logger);
}
