import { readFileSync } from 'node:fs';
import { writeFile } from '../util/fs';
import type { TypeSync, TypeSyncGenerateOptions } from '../interfaces';

export class TypeSyncImpl implements TypeSync {
  public async generate(opts: TypeSyncGenerateOptions): Promise<void> {
    const { pathToOutput, pathToSchema } = opts;
    const schemaAsString = readFileSync(pathToSchema).toString();
    const data = schemaAsString;
    await writeFile(pathToOutput, data);
  }
}
