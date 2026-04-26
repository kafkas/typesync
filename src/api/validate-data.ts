import type { core } from 'zod';

import type { schema } from '../schema/index.js';

/**
 * Options for `typesync.validateData()`.
 */
export interface ValidateDataOptions {
  /**
   * The exact path or a Glob pattern to the schema definition file or files. Each
   * definition file must be a YAML or JSON file containing model definitions.
   */
  definition: string;
  /**
   * The names of the document models to validate. Each entry must match the name of
   * a `document` model in the parsed definition. Mutually exclusive with `allModels`;
   * exactly one of the two must be provided.
   */
  models?: string[];
  /**
   * If `true`, validates every document model in the schema. Mutually exclusive with
   * `models`; exactly one of the two must be provided. This is opt-in because
   * validating every collection in a large project can be slow and expensive.
   */
  allModels?: boolean;
  /**
   * Path to a Google Cloud service account JSON file. If omitted, Typesync will fall
   * back to the `GOOGLE_APPLICATION_CREDENTIALS` environment variable, which is the
   * standard way to authenticate the Firebase Admin SDK.
   */
  serviceAccount?: string;
  /**
   * An optional Firebase project id. When provided, it overrides any value inferred
   * from credentials. Most commonly used together with `emulatorHost` for emulator
   * runs.
   */
  projectId?: string;
  /**
   * Points the validator at the Firestore emulator instead of a live project. The
   * value must be a `host:port` string (e.g. `localhost:8080`). This takes precedence
   * over the `FIRESTORE_EMULATOR_HOST` environment variable.
   */
  emulatorHost?: string;
  /**
   * The maximum number of retry attempts per batch for transient Firestore errors.
   * Default is 5.
   */
  maxRetries?: number;
  /**
   * The number of documents fetched per page by the underlying traverser. If omitted,
   * the default provided by `firewalk` is used.
   */
  batchSize?: number;
  /**
   * Stops validation for each model after this many documents. Useful for spot checks
   * on very large collections. By default the entire collection is scanned.
   */
  limit?: number;
  /**
   * Optional path to a file where the full JSON validation report will be written.
   */
  outFile?: string;
  /**
   * Invoked during the traversal so that callers (including the CLI) can show live
   * progress. Calls are throttled internally by the core implementation.
   */
  onProgress?: (event: ValidateDataProgressEvent) => void;
  /**
   * Enables verbose logs. Default is false.
   */
  debug?: boolean;
}

export type ValidateDataOption = keyof ValidateDataOptions;

/**
 * An event emitted during a data validation run.
 *
 * `docsScanned` is the number of documents validated against the model so far
 * (always equal to `valid + invalid`). `skipped` is the number of documents that
 * Firestore returned but were filtered out because they didn't match the model's
 * path template — this is non-zero only when the model path resolves to a
 * collection-group query and the database contains other collections with the same
 * leaf name.
 */
export type ValidateDataProgressEvent =
  | {
      type: 'model-started';
      model: string;
      collectionPath: string;
      isCollectionGroup: boolean;
    }
  | {
      type: 'batch-processed';
      model: string;
      docsScanned: number;
      valid: number;
      invalid: number;
      skipped: number;
    }
  | {
      type: 'model-completed';
      model: string;
      docsScanned: number;
      valid: number;
      invalid: number;
      skipped: number;
    }
  | {
      type: 'model-failed';
      model: string;
      error: string;
    };

/**
 * The result of a `typesync.validateData()` call.
 */
export interface ValidateDataResult {
  type: 'validate-data';
  /** The internal representation of the schema parsed from the definition. */
  schema: schema.Schema;
  summary: {
    totalModels: number;
    totalDocsScanned: number;
    totalValid: number;
    totalInvalid: number;
    /**
     * Total number of documents that Firestore returned but were filtered out as
     * belonging to a different model (collection-group leaf-name collisions). Always
     * `0` for runs in which no model resolved to a collection-group query.
     */
    totalSkipped: number;
    durationMs: number;
  };
  models: ValidateDataModelReport[];
}

/**
 * Per-model validation report.
 */
export interface ValidateDataModelReport {
  name: string;
  /**
   * The collection path (or model path template) that was traversed for this model.
   * For top-level models this is the collection name (e.g. `users`); for nested models
   * this is the full model path template (e.g. `users/{userId}/posts/{postId}`) so the
   * report disambiguates models that share a leaf collection name.
   */
  collectionPath: string;
  /**
   * Whether the model was traversed via a Firestore collection-group query. When
   * `true`, `skipped` may be non-zero if other collections share the same leaf name.
   */
  isCollectionGroup: boolean;
  /** Number of documents validated against this model's Zod schema (= valid + invalid). */
  docsScanned: number;
  valid: number;
  invalid: number;
  /**
   * Number of documents that Firestore returned through the collection-group query but
   * were filtered out because their path did not match the model's path template. These
   * documents belong to a different model and were not validated against this one.
   */
  skipped: number;
  /**
   * Individual document failures. Every entry describes one document that failed to
   * parse against the generated Zod schema.
   */
  failures: ValidateDataFailure[];
}

export interface ValidateDataFailure {
  docId: string;
  /** Full Firestore path of the failing document, e.g. `users/abc/posts/xyz`. */
  docPath: string;
  issues: core.$ZodIssue[];
}
