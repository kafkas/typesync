import { readFileSync } from 'node:fs';
import { Schema } from './Schema';

export class SchemaParser {
  public parseSchema(pathToSchema: string) {
    const schemaAsString = readFileSync(pathToSchema).toString();
    // TODO: Implement
    return new Schema();
  }
}
