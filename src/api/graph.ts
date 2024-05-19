import { GraphGeneration } from '../generators/graph/index.js';
import { objectKeys } from '../util/object-keys.js';
import { GenerateRepresentationResult } from './_common.js';

const SCHEMA_GRAPH_ORIENTATIONS = {
  vertical: true,
  horizontal: true,
};

export type SchemaGraphOrientation = keyof typeof SCHEMA_GRAPH_ORIENTATIONS;

export function getSchemaGraphOrientations() {
  return objectKeys(SCHEMA_GRAPH_ORIENTATIONS);
}

export interface GenerateGraphRepresentationOptions {
  definition: string;
  orientation?: SchemaGraphOrientation;
  debug?: boolean;
}

export interface GenerateGraphOptions extends GenerateGraphRepresentationOptions {
  outFile: string;
  startMarker?: string;
  endMarker?: string;
}

export type GenerateGraphOption = keyof GenerateGraphOptions;

export interface GenerateGraphRepresentationResult extends GenerateRepresentationResult {
  type: 'graph';

  /**
   * A structured representation of the generated graph.
   */
  generation: GraphGeneration;
}

export interface GenerateGraphResult extends GenerateGraphRepresentationResult {}
