import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

import { definition as definitionNew } from '../definition-new/index.js';
import { definition } from '../definition/index.js';
import {
  DefinitionFileFieldNotValidError,
  DefinitionFileNotValidYamlOrJsonError,
  DuplicateModelNameError,
} from '../errors/invalid-def.js';
import { assertNever } from '../util/assert.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import type { Logger } from './logger.js';

export interface DefinitionParser {
  parseDefinition(filePaths: string[]): definition.Definition;
  parseDefinitionNew(filePaths: string[]): definitionNew.Definition;
}

interface RawDefinitionFile {
  path: string;
  contentJson: unknown;
}

class DefinitionParserImpl implements DefinitionParser {
  public constructor(private readonly logger?: Logger) {}

  public parseDefinitionNew(filePaths: string[]): definitionNew.Definition {
    const rawDefinitionFiles: RawDefinitionFile[] = filePaths.map(path => ({
      path,
      contentJson: this.parseDefinitionFileAsJson(path),
    }));
    return rawDefinitionFiles.reduce<definitionNew.Definition>((acc, rawFile) => {
      const parsedFile = this.parseDefinitionFileWithSchema(rawFile, definitionNew.zodSchema);
      Object.entries(parsedFile.content).forEach(([modelName, model]) => {
        acc[modelName] = model;
      });
      return acc;
    }, {});
  }

  public parseDefinition(filePaths: string[]): definition.Definition {
    const rawDefinitionFiles: RawDefinitionFile[] = filePaths.map(path => ({
      path,
      contentJson: this.parseDefinitionFileAsJson(path),
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
