import { schema } from '../schema/index.js';
import { objectKeys } from '../util/object-keys.js';

const PYTHON_TARGETS = {
  'firebase-admin@6': true,
};

export type PythonGenerationTarget = keyof typeof PYTHON_TARGETS;

export function getPythonTargets() {
  return objectKeys(PYTHON_TARGETS);
}

export interface TypesyncGeneratePyRepresentationOptions {
  definition: string;
  target: PythonGenerationTarget;
  indentation?: number;
  customPydanticBase?: string;
  debug?: boolean;
}

export interface TypesyncGeneratePyOptions extends TypesyncGeneratePyRepresentationOptions {
  outFile: string;
}

export type TypesyncGeneratePyOption = keyof TypesyncGeneratePyOptions;

export interface TypesyncGeneratePyResult {
  type: 'python';
  schema: schema.Schema;
}
