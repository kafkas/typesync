/**
 * An emitter abstracts over how the mapping rules for turning a Typesync schema type
 * into a Zod construct are realized.
 *
 * Two concrete emitters are expected to exist eventually:
 *
 * 1. A runtime emitter (see `./_runtime-emitter.ts`) which produces live `z.ZodType`
 *    instances used for in-process validation. This is what powers the
 *    `typesync validate-data` command.
 * 2. A code-generating emitter (not yet implemented) which produces TypeScript source
 *    code strings and will power the upcoming `typesync generate-zod` feature.
 *
 * Every emitter follows the same traversal contract (implemented once in
 * `./build-zod-schema.ts`), which means the schema-to-Zod decision tree is
 * written exactly once and both consumers benefit.
 */
export interface ZodEmitter<TOut> {
  any(): TOut;
  unknown(): TOut;
  nullType(): TOut;
  string(): TOut;
  boolean(): TOut;
  int(): TOut;
  double(): TOut;
  timestamp(): TOut;

  stringLiteral(value: string): TOut;
  intLiteral(value: number): TOut;
  booleanLiteral(value: boolean): TOut;

  stringEnum(values: readonly string[]): TOut;
  intEnum(values: readonly number[]): TOut;

  tuple(elements: TOut[]): TOut;
  array(element: TOut): TOut;
  record(value: TOut): TOut;

  object(
    fields: ReadonlyArray<{
      name: string;
      value: TOut;
      optional: boolean;
    }>,
    additionalFields: boolean
  ): TOut;

  simpleUnion(variants: TOut[]): TOut;
  discriminatedUnion(discriminant: string, variants: TOut[]): TOut;

  /**
   * Emits a reference to another model in the schema. The runtime emitter resolves
   * this via `z.lazy`; a codegen emitter would emit a named identifier reference.
   */
  reference(modelName: string): TOut;
}
