import { writeFile } from '../util/fs';
import type { GenerationPlatform, TypeSync, TypeSyncGenerateOptions } from '../api';
import { SchemaParser } from './SchemaParser';
import { IOSGenerator } from './generators/ios';
import { TypeScriptGenerator } from './generators/typescript';
import { type GenerationOutput } from './GenerationOutput';

export class TypeSyncImpl implements TypeSync {
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
      case 'ios':
        return new IOSGenerator();
      case 'ts':
        return new TypeScriptGenerator();
    }
  }

  private async writeOutputToPath(path: string, output: GenerationOutput) {
    const outputAsString = output.toString();
    await writeFile(path, outputAsString);
  }
}
