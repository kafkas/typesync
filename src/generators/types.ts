import type { schema } from '../schema/index.js';
import { PythonGeneration } from './python/index.js';
import { TSGeneration } from './ts/index.js';

export type Generation = PythonGeneration | TSGeneration;

export interface Generator {
  generate(s: schema.Schema): Generation;
}
