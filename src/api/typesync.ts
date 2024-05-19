import { createTypesync } from '../core/typesync.js';
import { definition } from '../definition/index.js';
import { schema } from '../schema/index.js';
import type {
  GenerateGraphOptions,
  GenerateGraphRepresentationOptions,
  GenerateGraphRepresentationResult,
  GenerateGraphResult,
} from './graph.js';
import type {
  GeneratePythonOptions,
  GeneratePythonRepresentationOptions,
  GeneratePythonRepresentationResult,
  GeneratePythonResult,
} from './python.js';
import type {
  GenerateRulesOptions,
  GenerateRulesRepresentationOptions,
  GenerateRulesRepresentationResult,
  GenerateRulesResult,
} from './rules.js';
import type {
  GenerateSwiftOptions,
  GenerateSwiftRepresentationOptions,
  GenerateSwiftRepresentationResult,
  GenerateSwiftResult,
} from './swift.js';
import type {
  GenerateTsOptions,
  GenerateTsRepresentationOptions,
  GenerateTsRepresentationResult,
  GenerateTsResult,
} from './ts.js';

export interface GenerateRepresentationOptions {
  definition: string;
}

export interface GenerateRepresentationResult {
  /** The parsed definition. */
  definition: definition.Definition;
  /** The internal representation of the schema. */
  schema: schema.Schema;
}

export interface ValidateOptions {
  definition: string;
  debug?: boolean;
}

export type ValidateResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export interface Typesync {
  /**
   * Generates TypeScript type definitions for the specified schema and writes them to the specified file.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync generate-ts` command.
   */
  generateTs(opts: GenerateTsOptions): Promise<GenerateTsResult>;

  /**
   * Generates TypeScript type definitions for the specified schema and returns the generation and the internal representation of the schema without writing anything to the filesystem.
   */
  generateTsRepresentation(opts: GenerateTsRepresentationOptions): Promise<GenerateTsRepresentationResult>;

  /**
   * Generates Swift type definitions for the specified schema and writes them to the specified file.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync generate-swift` command.
   */
  generateSwift(opts: GenerateSwiftOptions): Promise<GenerateSwiftResult>;

  /**
   * Generates Swift type definitions for the specified schema and returns the generation and the internal representation of the schema without writing anything to the filesystem.
   */
  generateSwiftRepresentation(opts: GenerateSwiftRepresentationOptions): Promise<GenerateSwiftRepresentationResult>;

  /**
   * Generates Python/Pydantic type definitions for the specified schema and writes them to the specified file.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync generate-py` command.
   */
  generatePy(opts: GeneratePythonOptions): Promise<GeneratePythonResult>;

  /**
   * Generates Python/Pydantic type definitions for the specified schema and returns the generation and the internal representation of the schema without writing anything to the filesystem.
   */
  generatePyRepresentation(opts: GeneratePythonRepresentationOptions): Promise<GeneratePythonRepresentationResult>;

  /**
   * Generates type validator functions for Firestore Security Rules and injects them into the specified file.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync generate-rules` command.
   */
  generateRules(opts: GenerateRulesOptions): Promise<GenerateRulesResult>;

  /**
   * Generates type validator functions for Firestore Security Rules and returns the generation and the internal representation of the schema without writing anything to the filesystem.
   */
  generateRulesRepresentation(opts: GenerateRulesRepresentationOptions): Promise<GenerateRulesRepresentationResult>;

  /**
   * Generates a Mermaid graph for the specified schema and injects it into the specified file.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync generate-graph` command.
   */
  generateGraph(opts: GenerateGraphOptions): Promise<GenerateGraphResult>;

  /**
   * Generates a Mermaid graph for the specified schema and returns the generation and the internal representation of the
   * schema without writing anything to the filesystem.
   */
  generateGraphRepresentation(opts: GenerateGraphRepresentationOptions): Promise<GenerateGraphRepresentationResult>;

  /**
   * Checks if the specified schema definition is syntactically valid.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync validate` command.
   */
  validate(opts: ValidateOptions): Promise<ValidateResult>;

  /**
   * Build and returns the internal representation for the specified schema definition.
   */
  generateRepresentation(opts: GenerateRepresentationOptions): GenerateRepresentationResult;
}

export type GenerationResult =
  | GenerateTsResult
  | GenerateSwiftResult
  | GeneratePythonResult
  | GenerateRulesResult
  | GenerateGraphResult;

/**
 * The programmatic interface for the Typesync CLI.
 */
export const typesync = createTypesync();
