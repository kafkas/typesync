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
import { createSchemaParser } from './SchemaParserImpl';
import { createLogger } from './LoggerImpl';

class TypeSyncImpl implements TypeSync {
  private readonly logger: Logger;

  public constructor(private readonly config: TypeSyncConfig) {
    this.logger = createLogger(config.debug);
  }

  public async generate(opts: TypeSyncGenerateOptions) {
    const { pathToOutput, pathToSchema, platform } = opts;
    const parser = createSchemaParser(this.logger);
    const schema = parser.parseSchema(pathToSchema);
    const generator = this.getGeneratorForPlatform(platform);
    const output = await generator.generate(schema);
    await this.writeOutputToPath(pathToOutput, output);
  }

  private getGeneratorForPlatform(platform: GenerationPlatform) {
    switch (platform) {
      case 'swift':
        return createSwiftGenerator();
      case 'ts':
        return createTSGenerator();
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
