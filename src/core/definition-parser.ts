import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

import { definition } from '../definition/index.js';
import { DefinitionNotValidError, DefinitionNotValidYamlError } from '../errors/index.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import type { Logger } from './logger.js';

export interface DefinitionParser {
  parseDefinition(pathToDefinition: string): definition.Definition;
}

class DefinitionParserImpl implements DefinitionParser {
  public constructor(private readonly logger?: Logger) {}

  public parseDefinition(pathToDefinition: string): definition.Definition {
    const definitionJson = this.parseYamlFileAsJson(pathToDefinition);
    const aliasNames = this.extractAliasModelNames(definitionJson);
    const definitionSchema = definition.schemas.definition(aliasNames);
    return this.parseDefinitionWithSchema(definitionJson, definitionSchema);
  }

  private parseYamlFileAsJson(pathToFile: string): unknown {
    try {
      const yamlContent = readFileSync(pathToFile).toString();
      return parseYaml(yamlContent, { strict: true });
    } catch (e) {
      this.logger?.error(extractErrorMessage(e));
      throw new DefinitionNotValidYamlError(pathToFile);
    }
  }

  private extractAliasModelNames(definitionContentJson: unknown) {
    const parsedDefinition = this.parseDefinitionWithSchema(definitionContentJson, definition.schemas.definitionLoose);
    return Object.entries(parsedDefinition)
      .filter(([, model]) => model.model === 'alias')
      .map(([name]) => name);
  }

  private parseDefinitionWithSchema<T>(content: unknown, zodSchema: z.Schema<T>) {
    const parseRes = zodSchema.safeParse(content);

    if (!parseRes.success) {
      const { error } = parseRes;
      const [issue] = error.issues;
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

export function createDefinitionParser(logger?: Logger): DefinitionParser {
  return new DefinitionParserImpl(logger);
}
