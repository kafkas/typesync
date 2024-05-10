import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

import { definition } from '../definition/index.js';
import {
  DefinitionFileFieldNotValidError,
  DefinitionFileNotValidYamlOrJsonError,
  DuplicateModelNameError,
} from '../errors/invalid-def.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import type { Logger } from './logger.js';

export interface DefinitionParser {
  parseDefinition(filePaths: string[]): definition.Definition;
}

interface RawDefinitionFile {
  path: string;
  contentJson: unknown;
}

class DefinitionParserImpl implements DefinitionParser {
  public constructor(private readonly logger?: Logger) {}

  public parseDefinition(filePaths: string[]): definition.Definition {
    const rawDefinitionFiles: RawDefinitionFile[] = filePaths.map(path => ({
      path,
      contentJson: this.parseDefinitionFileAsJson(path),
    }));
    return rawDefinitionFiles.reduce<definition.Definition>((acc, rawFile) => {
      const parsedFile = this.parseDefinitionFileWithSchema(rawFile, definition.zodSchema);
      Object.entries(parsedFile.content).forEach(([modelName, model]) => {
        if (acc[modelName] !== undefined) {
          throw new DuplicateModelNameError(rawFile.path, modelName);
        }
        acc[modelName] = model;
      });
      return acc;
    }, {});
  }

  private parseDefinitionFileAsJson(pathToFile: string): unknown {
    try {
      const content = readFileSync(pathToFile).toString();
      if (pathToFile.endsWith('.json')) {
        return JSON.parse(content);
      } else {
        return parseYaml(content, { strict: true });
      }
    } catch (e) {
      this.logger?.error(extractErrorMessage(e));
      throw new DefinitionFileNotValidYamlOrJsonError(pathToFile);
    }
  }

  private parseDefinitionFileWithSchema<T>(rawFile: RawDefinitionFile, zodSchema: z.Schema<T>) {
    const parseRes = zodSchema.safeParse(rawFile.contentJson);

    if (!parseRes.success) {
      const { error } = parseRes;
      const [issue] = error.issues;
      if (issue) {
        const { message } = issue;
        const path = issue.path.join('.');
        throw new DefinitionFileFieldNotValidError(rawFile.path, path, message);
      } else {
        throw new DefinitionFileFieldNotValidError(rawFile.path, 'unknown', 'An unexpected invalid value.');
      }
    }

    return { path: rawFile.path, content: parseRes.data };
  }
}

export function createDefinitionParser(logger?: Logger): DefinitionParser {
  return new DefinitionParserImpl(logger);
}
