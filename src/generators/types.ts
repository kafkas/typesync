import type { schema } from '../schema';
import { PythonGeneration } from './python';
import { TSGeneration } from './ts';

export type Generation = PythonGeneration | TSGeneration;

export interface Generator {
  generate(s: schema.Schema): Generation;
}
