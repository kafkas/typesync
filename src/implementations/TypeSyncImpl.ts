import { writeFile } from '../util/fs';
import type {
  GenerationPlatform,
  GenerationOutput,
  TypeSync,
  Logger,
  TypeSyncConfig,
  TypeSyncGenerateOptions,
} from '../interfaces';
import { createSwiftGenerator } from './generators/SwiftGeneratorImpl';
import { createTSGenerator } from './generators/TSGeneratorImpl';
import { createDefinitionParser } from './DefinitionParserImpl';
import { createLogger } from './LoggerImpl';
import { assertNever } from '../util/assert';

class TypeSyncImpl implements TypeSync {
  private readonly logger: Logger;

  public constructor(private readonly config: TypeSyncConfig) {
    this.logger = createLogger(config.debug);
  }

  public async generate(opts: TypeSyncGenerateOptions) {
    const { pathToDefinition, pathToOutput, platform } = opts;
    const parser = createDefinitionParser(this.logger);
    const schema = parser.parseDefinition(pathToDefinition);
    const generator = this.getGeneratorForPlatform(platform);
    const output = await generator.generate(schema);
    await this.writeOutputToPath(pathToOutput, output);
  }

  private getGeneratorForPlatform(platform: GenerationPlatform) {
    switch (platform) {
      case 'ts:firebase-admin:11':
        return createTSGenerator({ platform, indentation: 2 });
      case 'swift':
        return createSwiftGenerator();
      default:
        assertNever(platform);
    }
  }

  private async writeOutputToPath(path: string, output: GenerationOutput) {
    const outputAsString = output.toString();
    await writeFile(path, outputAsString);
  }
}

export function createTypeSync(config: TypeSyncConfig): TypeSync {
  return new TypeSyncImpl(config);
}
