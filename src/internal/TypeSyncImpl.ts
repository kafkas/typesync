import { writeFile } from '../util/fs';
import type { GenerationPlatform, TypeSync, TypeSyncConfig, TypeSyncGenerateOptions } from '../api';
import { SchemaParser } from './SchemaParser';
import { SwiftGenerator } from './generators/swift';
import { TypeScriptGenerator } from './generators/typescript';
import { type GenerationOutput } from './GenerationOutput';

interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

class LoggerImpl implements Logger {
  public constructor(private readonly debug: boolean) {}

  public info(...args: any[]): void {
    if (this.debug) console.info(...args);
  }

  public error(...args: any[]): void {
    if (this.debug) console.error(...args);
  }

  public warn(...args: any[]): void {
    if (this.debug) console.warn(...args);
  }
}

export class TypeSyncImpl implements TypeSync {
  private readonly logger: Logger;

  public constructor(private readonly config: TypeSyncConfig) {
    this.logger = new LoggerImpl(config.debug);
  }

  public async generate(opts: TypeSyncGenerateOptions): Promise<void> {
    const { pathToOutput, pathToSchema, platform } = opts;
    const parser = new SchemaParser();
    const schema = parser.parseSchema(pathToSchema);
    const generator = this.getGeneratorForPlatform(platform);
    const output = await generator.generate(schema);
    await this.writeOutputToPath(pathToOutput, output);
  }

  private getGeneratorForPlatform(platform: GenerationPlatform) {
    switch (platform) {
      case 'swift':
        return new SwiftGenerator();
      case 'ts':
        return new TypeScriptGenerator();
    }
  }

  private async writeOutputToPath(path: string, output: GenerationOutput) {
    const outputAsString = output.toString();
    await writeFile(path, outputAsString);
  }
}
