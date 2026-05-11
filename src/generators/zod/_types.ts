import type { ZodGenerationTarget, ZodVariant } from '../../api/index.js';
import type { schema } from '../../schema/index.js';

export interface ZodSchemaDeclaration {
  type: 'schema';
  /** Original Typesync model name (e.g. `User`). */
  modelName: string;
  /**
   * Identifier under which the schema is exported in the generated file
   * (e.g. `UserSchema`). Derived from the schema name pattern.
   */
  schemaName: string;
  /** Documentation attached to the model in the source schema, if any. */
  modelDocs: string | null;
  /**
   * Pre-emitted Zod source code for the right-hand side of the export, e.g.
   * `z.strictObject({ ... })` or `z.string().describe('A user name')`. Already
   * includes any `.describe(...)` for the model-level docs.
   */
  expression: string;
  /** Whether the underlying model is an alias model or a document model. */
  modelKind: 'alias' | 'document';
}

export type ZodDeclaration = ZodSchemaDeclaration;

export interface ZodGeneration {
  type: 'zod';
  declarations: ZodDeclaration[];
  /**
   * Whether the generated file references the Firestore `Timestamp` class
   * anywhere. The renderer uses this to decide whether to emit the Firestore
   * SDK import.
   */
  usesTimestamp: boolean;
  /**
   * Whether the generated file references the Firestore bytes class anywhere
   * (`Buffer` for the admin SDK; `firestore.Bytes`/`firestore.Blob` otherwise).
   */
  usesBytes: boolean;
}

export interface ZodGeneratorConfig {
  target: ZodGenerationTarget;
  variant: ZodVariant;
  schemaNamePattern: string;
}

export interface ZodGenerator {
  generate(s: schema.Schema): ZodGeneration;
}
