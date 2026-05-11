import { schema } from '../../../schema/index.js';
import { createCodegenZodEmitter } from '../_codegen-emitter.js';
import { buildZodFromType } from '../build-zod-schema.js';

function emit(
  type: schema.types.Type,
  overrides: { variant?: 'v3' | 'v4'; target?: 'firebase-admin@13' | 'firebase@10' | 'react-native-firebase@21' } = {}
) {
  const emitter = createCodegenZodEmitter({
    variant: overrides.variant ?? 'v4',
    target: overrides.target ?? 'firebase-admin@13',
    getSchemaIdentifierForModel: name => `${name}Schema`,
  });
  return buildZodFromType(type, emitter);
}

describe('createCodegenZodEmitter()', () => {
  describe('primitives, literals, and enums', () => {
    it('emits the canonical zod constructor for each primitive type', () => {
      expect(emit({ type: 'any' })).toBe('z.any()');
      expect(emit({ type: 'unknown' })).toBe('z.unknown()');
      expect(emit({ type: 'nil' })).toBe('z.null()');
      expect(emit({ type: 'string' })).toBe('z.string()');
      expect(emit({ type: 'boolean' })).toBe('z.boolean()');
      expect(emit({ type: 'int' })).toBe('z.number().int()');
      expect(emit({ type: 'double' })).toBe('z.number()');
    });

    it('emits literals with JSON-encoded values so strings keep their quotes', () => {
      expect(emit({ type: 'string-literal', value: "it's" })).toBe(`z.literal("it's")`);
      expect(emit({ type: 'int-literal', value: 42 })).toBe('z.literal(42)');
      expect(emit({ type: 'boolean-literal', value: true })).toBe('z.literal(true)');
    });

    it('collapses single-member enums to z.literal and folds multi-member enums into a union', () => {
      const single = emit({ type: 'string-enum', members: [{ label: 'A', value: 'a' }] });
      expect(single).toBe(`z.literal("a")`);

      const multi = emit({
        type: 'string-enum',
        members: [
          { label: 'Red', value: 'red' },
          { label: 'Blue', value: 'blue' },
        ],
      });
      expect(multi).toBe(`z.union([z.literal("red"), z.literal("blue")])`);
    });
  });

  describe('Firestore-bound primitives', () => {
    it('uses Buffer for bytes on the admin target and firestore.Bytes/Blob for the others', () => {
      expect(emit({ type: 'bytes' }, { target: 'firebase-admin@13' })).toBe('z.instanceof(Buffer)');
      expect(emit({ type: 'bytes' }, { target: 'firebase@10' })).toBe('z.instanceof(firestore.Bytes)');
      expect(emit({ type: 'bytes' }, { target: 'react-native-firebase@21' })).toBe('z.instanceof(firestore.Blob)');
    });

    it('uses firestore.Timestamp regardless of target so the runtime check matches the SDK class', () => {
      expect(emit({ type: 'timestamp' }, { target: 'firebase-admin@13' })).toBe('z.instanceof(firestore.Timestamp)');
      expect(emit({ type: 'timestamp' }, { target: 'firebase@10' })).toBe('z.instanceof(firestore.Timestamp)');
    });
  });

  describe('records, arrays, and tuples', () => {
    it('emits z.record without a key schema for v3 and with z.string() for v4', () => {
      const type: schema.types.Map = { type: 'map', valueType: { type: 'string' } };
      expect(emit(type, { variant: 'v3' })).toBe('z.record(z.string())');
      expect(emit(type, { variant: 'v4' })).toBe('z.record(z.string(), z.string())');
    });

    it('emits z.array(value) and z.tuple([...]) consistently across variants', () => {
      expect(emit({ type: 'list', elementType: { type: 'string' } })).toBe('z.array(z.string())');
      expect(emit({ type: 'tuple', elements: [{ type: 'string' }, { type: 'int' }] })).toBe(
        'z.tuple([z.string(), z.number().int()])'
      );
      expect(emit({ type: 'tuple', elements: [] })).toBe('z.tuple([])');
    });
  });

  describe('object types', () => {
    function makeField(
      overrides: Partial<schema.types.ObjectField> & { name: string; type: schema.types.Type }
    ): schema.types.ObjectField {
      return {
        optional: false,
        readonly: false,
        docs: null,
        ...overrides,
      };
    }

    const objectType: schema.types.Object = {
      type: 'object',
      additionalFields: false,
      fields: [
        makeField({ name: 'id', type: { type: 'string' }, docs: 'The id' }),
        makeField({ name: 'age', type: { type: 'int' }, optional: true }),
      ],
    };

    it('uses z.object().strict()/.passthrough() for v3 and z.strictObject/z.looseObject for v4', () => {
      const v3Strict = emit(objectType, { variant: 'v3' });
      expect(v3Strict).toContain(`.strict()`);
      expect(v3Strict.startsWith('z.object(')).toBe(true);

      const v3Loose = emit({ ...objectType, additionalFields: true }, { variant: 'v3' });
      expect(v3Loose).toContain(`.passthrough()`);

      const v4Strict = emit(objectType, { variant: 'v4' });
      expect(v4Strict.startsWith('z.strictObject(')).toBe(true);

      const v4Loose = emit({ ...objectType, additionalFields: true }, { variant: 'v4' });
      expect(v4Loose.startsWith('z.looseObject(')).toBe(true);
    });

    it('attaches .describe(...) to the inner value for fields with docs and wraps optional fields with .optional()', () => {
      const out = emit(objectType, { variant: 'v4' });
      expect(out).toContain(`id: z.string().describe("The id")`);
      expect(out).toContain(`age: z.number().int().optional()`);
    });

    it('quotes property names that are not valid JS identifiers', () => {
      const trickyObject: schema.types.Object = {
        type: 'object',
        additionalFields: false,
        fields: [
          makeField({ name: 'kebab-key', type: { type: 'string' } }),
          makeField({ name: '1startsWithDigit', type: { type: 'string' } }),
        ],
      };
      const out = emit(trickyObject);
      expect(out).toContain(`"kebab-key":`);
      expect(out).toContain(`"1startsWithDigit":`);
    });
  });

  describe('unions', () => {
    it('emits z.union([...]) for simple unions and unwraps single-variant unions', () => {
      const single = emit({ type: 'simple-union', variants: [{ type: 'string' }] });
      expect(single).toBe('z.string()');

      const multi = emit({
        type: 'simple-union',
        variants: [{ type: 'string' }, { type: 'int' }],
      });
      expect(multi).toBe('z.union([z.string(), z.number().int()])');
    });

    it('emits z.discriminatedUnion(<key>, [...]) for discriminated unions', () => {
      const out = emit({
        type: 'discriminated-union',
        discriminant: 'kind',
        variants: [
          { type: 'alias', name: 'Cat' },
          { type: 'alias', name: 'Dog' },
        ],
      });
      expect(out).toBe(`z.discriminatedUnion("kind", [z.lazy(() => CatSchema), z.lazy(() => DogSchema)])`);
    });
  });

  describe('alias references', () => {
    it('emits z.lazy(() => Identifier) using the configured identifier mapper', () => {
      const out = emit({ type: 'alias', name: 'User' });
      expect(out).toBe('z.lazy(() => UserSchema)');
    });
  });
});
