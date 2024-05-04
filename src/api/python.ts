import { schema } from '../schema/index.js';
import { objectKeys } from '../util/object-keys.js';

const PYTHON_TARGETS = {
  'firebase-admin@6': true,
};

export type PythonGenerationTarget = keyof typeof PYTHON_TARGETS;

export function getPythonTargets() {
  return objectKeys(PYTHON_TARGETS);
}

export interface GeneratePythonRepresentationOptions {
  definition: string;
  target: PythonGenerationTarget;
  debug?: boolean;
}

export interface GeneratePythonOptions extends GeneratePythonRepresentationOptions {
  outFile: string;
  customPydanticBase?: string;
  indentation?: number;
}

export type GeneratePythonOption = keyof GeneratePythonOptions;

export interface GeneratePythonResult {
  type: 'python';
  schema: schema.Schema;
}