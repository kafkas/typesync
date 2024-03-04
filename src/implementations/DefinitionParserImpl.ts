import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { getDefinitionSchema } from '../definition';
import type { Logger, DefinitionParser } from '../interfaces';
import { extractErrorMessage } from '../util/extract-error-message';
import { DefinitionNotValidYamlError, DefinitionNotValidError } from '../errors';
import { createSchema } from './SchemaImpl';
import { z } from 'zod';

class DefinitionParserImpl implements DefinitionParser {
  public constructor(private readonly logger: Logger) {}

  public parseDefinition(pathToDefinition: string) {
    const definitionJson = this.parseYamlFileAsJson(pathToDefinition);
    const aliasNames = this.extractAliasModelNames(definitionJson);
    const definitionSchema = getDefinitionSchema(aliasNames);
    const parsedDefinition = this.parseDefinitionWithSchema(definitionJson, definitionSchema);
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

  private extractAliasModelNames(definitionContentJson: unknown) {
    const looseDefinitionSchema = z.record(
      z.object({
        type: z.enum(['document', 'alias']),
      })
    );
    const parsedDefinition = this.parseDefinitionWithSchema(definitionContentJson, looseDefinitionSchema);
    return Object.entries(parsedDefinition)
      .filter(([, model]) => model.type === 'alias')
      .map(([name]) => name);
  }

  private parseDefinitionWithSchema<T>(content: unknown, schema: z.Schema<T>) {
    const parseRes = schema.safeParse(content);

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