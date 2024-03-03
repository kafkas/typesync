import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type { Logger, DefinitionParser } from '../interfaces';
import { extractErrorMessage } from '../util/extract-error-message';
import { DefinitionNotValidYamlError, DefinitionNotValidError } from '../errors';
import { createSchema } from './SchemaImpl';

const defPrimitiveValueTypeSchema = z.enum(['string', 'boolean', 'int']);

const defEnumValueTypeSchema = z.object({
  type: z.literal('enum'),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string().or(z.number()),
    })
  ),
});

const defComplexValueTypeSchema = defEnumValueTypeSchema;

const defValueTypeSchema = defPrimitiveValueTypeSchema.or(defComplexValueTypeSchema);

const defModelFieldSchema = z
  .object({
    type: defValueTypeSchema,
    optional: z.boolean().optional(),
    docs: z.string().optional(),
  })
  .strict();

const defDocumentModelSchema = z
  .object({
    type: z.literal('document'),
    docs: z.string().optional(),
    fields: z.record(defModelFieldSchema),
  })
  .strict();

const defAliasModelSchema = z
  .object({
    type: z.literal('alias'),
    docs: z.string().optional(),
    value: defValueTypeSchema,
  })
  .strict();

const defModelSchema = z.discriminatedUnion('type', [defDocumentModelSchema, defAliasModelSchema]);

const definitionSchema = z.record(defModelSchema);

class DefinitionParserImpl implements DefinitionParser {
  public constructor(private readonly logger: Logger) {}

  public parseDefinition(pathToDefinition: string) {
    const definitionJson = this.parseYamlFileAsJson(pathToDefinition);
    const parsedDefinition = this.parseSchemaYamlContentJson(definitionJson);
    return createSchema(parsedDefinition);
  }

  private parseYamlFileAsJson(pathToFile: string): unknown {
    try {
      const yamlContent = readFileSync(pathToFile).toString();
      return parseYaml(yamlContent, { strict: true });
    } catch (e) {
      this.logger.error(extractErrorMessage(e));
      throw new DefinitionNotValidYamlError(pathToFile);
    }
  }

  private parseSchemaYamlContentJson(contentJson: unknown) {
    const parseRes = definitionSchema.safeParse(contentJson);

    if (!parseRes.success) {
      const { error } = parseRes;
      const issue = error.issues[0];
      if (issue) {
        const { message } = issue;
        const path = issue.path.join('.');
        throw new DefinitionNotValidError(path, message);
      } else {
        throw new DefinitionNotValidError('unknown', 'An unexpected invalid value.');
      }
    }

    return parseRes.data;
  }
}

export function createDefinitionParser(logger: Logger): DefinitionParser {
  return new DefinitionParserImpl(logger);
}
