import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

import { definition } from '../definition';
import { DefinitionNotValidError, DefinitionNotValidYamlError } from '../errors';
import type { DefinitionParser, Logger } from '../interfaces';
import { schema } from '../schema';
import { extractErrorMessage } from '../util/extract-error-message';

class DefinitionParserImpl implements DefinitionParser {
  public constructor(private readonly logger: Logger) {}

  public parseDefinition(pathToDefinition: string): schema.Schema {
    const definitionJson = this.parseYamlFileAsJson(pathToDefinition);
    const aliasNames = this.extractAliasModelNames(definitionJson);
    const definitionSchema = definition.schemas.definition(aliasNames);
    const parsedDefinition = this.parseDefinitionWithSchema(definitionJson, definitionSchema);
    return schema.createFromDefinition(parsedDefinition);
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

  private parseDefinitionWithSchema<T>(content: unknown, zodSchema: z.Schema<T>) {
    const parseRes = zodSchema.safeParse(content);

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
