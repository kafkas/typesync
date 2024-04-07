import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

import { definition } from '../definition/index.js';
import {
  DefinitionFileFieldNotValidError,
  DefinitionFileNotValidYamlError,
  DuplicateModelNameError,
} from '../errors/index.js';
import { assertNever } from '../util/assert.js';
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
      contentJson: this.parseYamlFileAsJson(path),
    }));
    const { aliasModelNames } = this.extractModelNamesFromDefinitionFiles(rawDefinitionFiles);
    const definitionFileSchema = definition.schemas.definitionWithKnownAliases(aliasModelNames);
    return rawDefinitionFiles.reduce<definition.Definition>((acc, rawFile) => {
      const parsedFile = this.parseDefinitionFileWithSchema(rawFile, definitionFileSchema);
      Object.entries(parsedFile.content).forEach(([modelName, model]) => {
        acc[modelName] = model;
      });
      return acc;
    }, {});
  }

  private parseYamlFileAsJson(pathToFile: string): unknown {
    try {
      const yamlContent = readFileSync(pathToFile).toString();
      return parseYaml(yamlContent, { strict: true });
    } catch (e) {
      this.logger?.error(extractErrorMessage(e));
      throw new DefinitionFileNotValidYamlError(pathToFile);
    }
  }

  private extractModelNamesFromDefinitionFiles(rawDefinitionFiles: RawDefinitionFile[]) {
    const aliasModelNameSet = new Set<string>();
    const documentModelNameSet = new Set<string>();

    rawDefinitionFiles.forEach(rawFile => {
      const { path } = rawFile;
      const parsedFile = this.parseDefinitionFileWithSchema(rawFile, definition.schemas.definition);
      Object.entries(parsedFile.content).forEach(([modelName, model]) => {
        if (aliasModelNameSet.has(modelName) || documentModelNameSet.has(modelName)) {
          throw new DuplicateModelNameError(path, modelName);
        }
        if (model.model === 'alias') {
          aliasModelNameSet.add(modelName);
        } else if (model.model === 'document') {
          documentModelNameSet.add(modelName);
        } else {
          assertNever(model);
        }
      });
    });

    return {
      aliasModelNames: Array.from(aliasModelNameSet.values()),
      documentModelNames: Array.from(documentModelNameSet.values()),
    };
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
