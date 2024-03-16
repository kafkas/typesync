import type { TypeSync, TypeSyncGenerateOptions } from '../api';
import { createPythonGenerator } from '../generators/python';
import { createTSGenerator } from '../generators/ts';
import type { GenerationOutput } from '../interfaces';
import { schema } from '../schema';
import { assertNever } from '../util/assert';
import { writeFile } from '../util/fs';
import { createDefinitionParser } from './definition-parser';
import { createLogger } from './logger';

class TypeSyncImpl implements TypeSync {
  public async generate(opts: TypeSyncGenerateOptions) {
    const { pathToDefinition, pathToOutput, debug } = opts;
    const logger = createLogger(debug);
    const parser = createDefinitionParser(logger);
    const def = parser.parseDefinition(pathToDefinition);
    const s = schema.createFromDefinition(def);
    const generator = this.createGenerator(opts);
    const output = await generator.generate(s);
    await this.writeOutputToPath(pathToOutput, output);
  }

  private createGenerator(opts: TypeSyncGenerateOptions) {
    const { platform, indentation } = opts;
    switch (platform) {
      case 'ts:firebase-admin:11':
        return createTSGenerator({ platform, indentation });
      case 'py:firebase-admin:6':
        return createPythonGenerator({ platform, indentation });
      default:
        assertNever(platform);
    }
  }

  private async writeOutputToPath(path: string, output: GenerationOutput) {
    const outputAsString = output.toString();
    await writeFile(path, outputAsString);
  }
}

export function createTypeSync(): TypeSync {
  return new TypeSyncImpl();
}
