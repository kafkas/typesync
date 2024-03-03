import { readFileSync } from 'node:fs';
import { TypeSync, type TypeSyncGenerateOptions } from './interface';
import { writeFile } from './util/fs';

class TypeSyncImpl implements TypeSync {
  public async generate(opts: TypeSyncGenerateOptions): Promise<void> {
    const { pathToOutput, pathToSchema } = opts;
    const schemaAsString = readFileSync(pathToSchema).toString();
    const data = schemaAsString;
    await writeFile(pathToOutput, data);
  }
}

export function createTypeSync(): TypeSync {
  return new TypeSyncImpl();
}
