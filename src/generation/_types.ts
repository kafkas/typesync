export interface PythonGeneration {
  type: 'python';
}

export interface TSGeneration {
  type: 'ts';
}

export type Generation = PythonGeneration | TSGeneration;
