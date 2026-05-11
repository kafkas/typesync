import type { ZodGenerationTarget, ZodVariant } from '../../../api/index.js';
import { schema } from '../../../schema/index.js';
import { createZodGenerator } from '../_impl.js';

function createGenerator(
  overrides: { target?: ZodGenerationTarget; variant?: ZodVariant; schemaNamePattern?: string } = {}
) {
  return createZodGenerator({
    target: overrides.target ?? 'firebase-admin@13',
    variant: overrides.variant ?? 'v4',
    schemaNamePattern: overrides.schemaNamePattern ?? '{modelName}Schema',
  });
}

describe('ZodGeneratorImpl', () => {
  it('produces an empty generation for an empty schema and reports no Firestore-typed fields', () => {
    const generation = createGenerator().generate(schema.createSchema());
    expect(generation).toEqual({
      type: 'zod',
      declarations: [],
      usesTimestamp: false,
      usesBytes: false,
    });
  });

  it('emits one declaration per alias and document model with the right schemaName/modelKind', () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string' },
      User: {
        model: 'document',
        path: 'users/{userId}',
        type: { type: 'object', fields: { name: { type: 'Username' } } },
      },
    });

    const generation = createGenerator().generate(s);
    expect(generation.declarations).toHaveLength(2);

    const username = generation.declarations.find(d => d.modelName === 'Username');
    expect(username).toMatchObject({
      type: 'schema',
      schemaName: 'UsernameSchema',
      modelKind: 'alias',
      modelDocs: null,
    });

    const user = generation.declarations.find(d => d.modelName === 'User');
    expect(user).toMatchObject({ schemaName: 'UserSchema', modelKind: 'document' });
  });

  it('honours a custom schemaNamePattern when generating identifiers and reference expressions', () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string' },
      User: {
        model: 'document',
        path: 'users/{userId}',
        type: { type: 'object', fields: { name: { type: 'Username' } } },
      },
    });

    const generation = createGenerator({ schemaNamePattern: 'z{modelName}' }).generate(s);
    const userDecl = generation.declarations.find(d => d.modelName === 'User');
    expect(userDecl?.schemaName).toBe('zUser');
    // Reference into Username should use the same pattern
    expect(userDecl?.expression).toContain('z.lazy(() => zUsername)');
  });

  it('appends .describe(...) to the right-hand expression when the model has docs', () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string', docs: 'A unique handle.' },
      Plain: { model: 'alias', type: 'string' },
    });

    const generation = createGenerator().generate(s);
    const documented = generation.declarations.find(d => d.modelName === 'Username');
    const undocumented = generation.declarations.find(d => d.modelName === 'Plain');

    expect(documented?.expression).toBe(`z.string().describe("A unique handle.")`);
    expect(undocumented?.expression).toBe('z.string()');
  });

  it('threads field-level docs through as .describe(...) on the field value', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'alias',
        type: {
          type: 'object',
          fields: {
            id: { type: 'string', docs: 'The profile ID' },
            bio: { type: 'string', optional: true },
          },
        },
      },
    });

    const generation = createGenerator({ variant: 'v4' }).generate(s);
    const profile = generation.declarations.find(d => d.modelName === 'Profile');
    expect(profile?.expression).toContain(`id: z.string().describe("The profile ID")`);
    expect(profile?.expression).toContain(`bio: z.string().optional()`);
  });

  it('reports usesTimestamp/usesBytes accurately by walking every model type', () => {
    const sBoth = schema.createSchemaFromDefinition({
      Stamp: { model: 'alias', type: 'timestamp' },
      Blob: { model: 'alias', type: 'bytes' },
    });
    const gBoth = createGenerator().generate(sBoth);
    expect(gBoth.usesTimestamp).toBe(true);
    expect(gBoth.usesBytes).toBe(true);

    const sNone = schema.createSchemaFromDefinition({ Name: { model: 'alias', type: 'string' } });
    const gNone = createGenerator().generate(sNone);
    expect(gNone.usesTimestamp).toBe(false);
    expect(gNone.usesBytes).toBe(false);
  });

  it('detects bytes/timestamp usage even when nested inside lists/maps/objects', () => {
    const s = schema.createSchemaFromDefinition({
      Doc: {
        model: 'document',
        path: 'docs/{docId}',
        type: {
          type: 'object',
          fields: {
            createdAt: { type: 'timestamp' },
            attachments: { type: { type: 'list', elementType: 'bytes' } },
          },
        },
      },
    });
    const generation = createGenerator().generate(s);
    expect(generation.usesTimestamp).toBe(true);
    expect(generation.usesBytes).toBe(true);
  });

  it('does not mutate the input schema', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'document',
        path: 'profiles/{profileId}',
        type: { type: 'object', fields: { name: { type: 'string' } } },
      },
    });
    const snapshot = s.clone();
    createGenerator().generate(s);
    expect(s.aliasModels).toEqual(snapshot.aliasModels);
    expect(s.documentModels).toEqual(snapshot.documentModels);
  });

  it('emits matching expressions for both v3 and v4 except for object factory and record key', () => {
    const s = schema.createSchemaFromDefinition({
      Lookup: { model: 'alias', type: { type: 'map', valueType: 'int' } },
      Box: {
        model: 'alias',
        type: { type: 'object', fields: { id: { type: 'string' } }, additionalFields: true },
      },
    });
    const v3 = createGenerator({ variant: 'v3' }).generate(s);
    const v4 = createGenerator({ variant: 'v4' }).generate(s);

    const lookupV3 = v3.declarations.find(d => d.modelName === 'Lookup')?.expression;
    const lookupV4 = v4.declarations.find(d => d.modelName === 'Lookup')?.expression;
    expect(lookupV3).toBe('z.record(z.number().int())');
    expect(lookupV4).toBe('z.record(z.string(), z.number().int())');

    const boxV3 = v3.declarations.find(d => d.modelName === 'Box')?.expression;
    const boxV4 = v4.declarations.find(d => d.modelName === 'Box')?.expression;
    expect(boxV3).toContain(`.passthrough()`);
    expect(boxV4?.startsWith('z.looseObject(')).toBe(true);
  });
});
