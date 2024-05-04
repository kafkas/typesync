import { schema } from '../schema/index.js';
import { objectKeys } from '../util/object-keys.js';

const PYTHON_TARGETS = {
  'firebase-admin@6': true,
};

export type PythonGenerationTarget = keyof typeof PYTHON_TARGETS;

export function getPythonTargets() {
  return objectKeys(PYTHON_TARGETS);
}

export interface TypesyncGeneratePythonRepresentationOptions {
  definition: string;
  target: PythonGenerationTarget;
  debug?: boolean;
}

export interface TypesyncGeneratePythonOptions extends TypesyncGeneratePythonRepresentationOptions {
  outFile: string;
  customPydanticBase?: string;
  indentation?: number;
}

export type TypesyncGeneratePythonOption = keyof TypesyncGeneratePythonOptions;

export interface TypesyncGeneratePythonResult {
  type: 'python';
  schema: schema.Schema;
}
