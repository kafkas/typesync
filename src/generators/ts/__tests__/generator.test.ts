import { schema } from '../../../schema/index.js';
import { createTSGenerator } from '../_impl.js';
import type { TSGeneration } from '../_types.js';

function createGenerator(objectTypeFormat: 'interface' | 'type-alias' = 'interface') {
  return createTSGenerator({ target: 'firebase-admin@13', objectTypeFormat });
}

describe('TSGeneratorImpl', () => {
  it('produces an empty generation for an empty schema', () => {
    const generation = createGenerator().generate(schema.createSchema());
    expect(generation).toEqual<TSGeneration>({ type: 'ts', declarations: [] });
  });

  it('converts each primitive type to its TS counterpart', () => {
    const s = schema.createSchemaFromDefinition({
      AnyAlias: { model: 'alias', type: 'any' },
      UnknownAlias: { model: 'alias', type: 'unknown' },
      NilAlias: { model: 'alias', type: 'nil' },
      StringAlias: { model: 'alias', type: 'string' },
      BooleanAlias: { model: 'alias', type: 'boolean' },
      IntAlias: { model: 'alias', type: 'int' },
      DoubleAlias: { model: 'alias', type: 'double' },
      TimestampAlias: { model: 'alias', type: 'timestamp' },
    });

    const generation = createGenerator().generate(s);

    const expectedTsTypeByModelName: Record<string, { type: string }> = {
      AnyAlias: { type: 'any' },
      UnknownAlias: { type: 'unknown' },
      NilAlias: { type: 'null' },
      StringAlias: { type: 'string' },
      BooleanAlias: { type: 'boolean' },
      IntAlias: { type: 'number' },
      DoubleAlias: { type: 'number' },
      TimestampAlias: { type: 'timestamp' },
    };

    expect(generation.declarations).toHaveLength(Object.keys(expectedTsTypeByModelName).length);
    generation.declarations.forEach(decl => {
      expect(decl.type).toBe('alias');
      expect(decl.modelType).toEqual(expectedTsTypeByModelName[decl.modelName]);
    });
  });

  it('converts literal types to TS literal types preserving the value', () => {
    const s = schema.createSchemaFromDefinition({
      StringLit: { model: 'alias', type: { type: 'literal', value: 'cat' } },
      IntLit: { model: 'alias', type: { type: 'literal', value: 7 } },
      BoolLit: { model: 'alias', type: { type: 'literal', value: true } },
    });

    const generation = createGenerator().generate(s);

    const literalDeclarations = generation.declarations.filter(d => d.modelType.type === 'literal');
    expect(literalDeclarations).toHaveLength(3);
    expect(literalDeclarations.map(d => d.modelType)).toEqual(
      expect.arrayContaining([
        { type: 'literal', value: 'cat' },
        { type: 'literal', value: 7 },
        { type: 'literal', value: true },
      ])
    );
  });

  it('converts string and int enum types into TS enum types preserving members', () => {
    const s = schema.createSchemaFromDefinition({
      Color: {
        model: 'alias',
        type: {
          type: 'enum',
          members: [
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
          ],
        },
      },
      Priority: {
        model: 'alias',
        type: {
          type: 'enum',
          members: [
            { label: 'Low', value: 1 },
            { label: 'High', value: 2 },
          ],
        },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations.find(d => d.modelName === 'Color')?.modelType).toEqual({
      type: 'enum',
      members: [
        { label: 'Red', value: 'red' },
        { label: 'Green', value: 'green' },
      ],
    });
    expect(generation.declarations.find(d => d.modelName === 'Priority')?.modelType).toEqual({
      type: 'enum',
      members: [
        { label: 'Low', value: 1 },
        { label: 'High', value: 2 },
      ],
    });
  });

  it('converts container types (tuple, list, map) into TS tuple/list/record', () => {
    const s = schema.createSchemaFromDefinition({
      Coords: { model: 'alias', type: { type: 'tuple', elements: ['int', 'int'] } },
      Tags: { model: 'alias', type: { type: 'list', elementType: 'string' } },
      Lookup: { model: 'alias', type: { type: 'map', valueType: 'int' } },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations.find(d => d.modelName === 'Coords')?.modelType).toEqual({
      type: 'tuple',
      elements: [{ type: 'number' }, { type: 'number' }],
    });
    expect(generation.declarations.find(d => d.modelName === 'Tags')?.modelType).toEqual({
      type: 'list',
      elementType: { type: 'string' },
    });
    expect(generation.declarations.find(d => d.modelName === 'Lookup')?.modelType).toEqual({
      type: 'record',
      valueType: { type: 'number' },
    });
  });

  it('converts simple and discriminated unions into TS union types', () => {
    const s = schema.createSchemaFromDefinition({
      Cat: {
        model: 'alias',
        type: {
          type: 'object',
          fields: {
            type: { type: { type: 'literal', value: 'cat' } },
            lives: { type: 'int' },
          },
        },
      },
      Dog: {
        model: 'alias',
        type: {
          type: 'object',
          fields: {
            type: { type: { type: 'literal', value: 'dog' } },
            breed: { type: 'string' },
          },
        },
      },
      Pet: {
        model: 'alias',
        type: { type: 'union', discriminant: 'type', variants: ['Cat', 'Dog'] },
      },
      StringOrInt: {
        model: 'alias',
        type: { type: 'union', variants: ['string', 'int'] },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations.find(d => d.modelName === 'Pet')?.modelType).toEqual({
      type: 'union',
      variants: [
        { type: 'alias', name: 'Cat' },
        { type: 'alias', name: 'Dog' },
      ],
    });
    expect(generation.declarations.find(d => d.modelName === 'StringOrInt')?.modelType).toEqual({
      type: 'union',
      variants: [{ type: 'string' }, { type: 'number' }],
    });
  });

  it('converts alias references to TS alias types preserving the model name', () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string' },
      Profile: {
        model: 'alias',
        type: { type: 'object', fields: { name: { type: 'Username' } } },
      },
    });

    const generation = createGenerator().generate(s);

    const profileDecl = generation.declarations.find(d => d.modelName === 'Profile');
    expect(profileDecl?.modelType).toMatchObject({
      type: 'object',
      properties: [{ type: { type: 'alias', name: 'Username' }, name: 'name' }],
    });
  });

  it('preserves field-level docs, optional flags, and additionalFields on object types', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'alias',
        type: {
          type: 'object',
          additionalFields: true,
          fields: {
            id: { type: 'string', docs: 'The profile ID' },
            bio: { type: 'string', optional: true },
          },
        },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]?.modelType).toEqual({
      type: 'object',
      additionalProperties: true,
      properties: [
        { name: 'id', type: { type: 'string' }, optional: false, docs: 'The profile ID' },
        { name: 'bio', type: { type: 'string' }, optional: true, docs: null },
      ],
    });
  });

  it('preserves model-level docs on declarations and defaults to null when absent', () => {
    const s = schema.createSchemaFromDefinition({
      Documented: { model: 'alias', type: 'string', docs: 'A documented alias' },
      Undocumented: { model: 'alias', type: 'string' },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations.find(d => d.modelName === 'Documented')?.modelDocs).toBe('A documented alias');
    expect(generation.declarations.find(d => d.modelName === 'Undocumented')?.modelDocs).toBeNull();
  });

  it(`emits an 'interface' declaration for objects when objectTypeFormat is 'interface'`, () => {
    const s = schema.createSchemaFromDefinition({
      Profile: { model: 'alias', type: { type: 'object', fields: { id: { type: 'string' } } } },
    });

    const generation = createGenerator('interface').generate(s);

    expect(generation.declarations[0]?.type).toBe('interface');
  });

  it(`emits a type 'alias' declaration for objects when objectTypeFormat is 'type-alias'`, () => {
    const s = schema.createSchemaFromDefinition({
      Profile: { model: 'alias', type: { type: 'object', fields: { id: { type: 'string' } } } },
    });

    const generation = createGenerator('type-alias').generate(s);

    expect(generation.declarations[0]?.type).toBe('alias');
  });

  it('emits declarations for document models in addition to alias models', () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string' },
      Profile: {
        model: 'document',
        path: 'profiles/{profileId}',
        type: { type: 'object', fields: { username: { type: 'Username' } } },
        docs: 'A user profile',
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations).toHaveLength(2);
    const profileDecl = generation.declarations.find(d => d.modelName === 'Profile');
    expect(profileDecl?.type).toBe('interface');
    expect(profileDecl?.modelDocs).toBe('A user profile');
  });

  it('places alias declarations before document declarations in the output', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'document',
        path: 'profiles/{profileId}',
        type: { type: 'object', fields: { name: { type: 'string' } } },
      },
      Username: { model: 'alias', type: 'string' },
    });

    const generation = createGenerator().generate(s);
    const declTypes = generation.declarations.map(d => ({ name: d.modelName, model: d.type }));
    expect(declTypes).toEqual([
      { name: 'Username', model: 'alias' },
      { name: 'Profile', model: 'interface' },
    ]);
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
});
