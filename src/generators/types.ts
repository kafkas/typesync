import type { schema } from '../schema/index.js';
import { PythonGeneration } from './python/index.js';
import { SwiftGeneration } from './swift/index.js';
import { TSGeneration } from './ts/index.js';

export type Generation = TSGeneration | SwiftGeneration | PythonGeneration;

export interface Generator {
  generate(s: schema.Schema): Generation;
}
