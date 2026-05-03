import { schema } from '../../../schema/index.js';
import { createPythonGenerator } from '../_impl.js';

function createGenerator() {
  return createPythonGenerator({ target: 'firebase-admin@6' });
}

describe('PythonGeneratorImpl', () => {
  it('produces an empty generation for an empty schema', () => {
    const generation = createGenerator().generate(schema.createSchema());
    expect(generation).toEqual({ type: 'python', declarations: [] });
  });

  it('emits an alias declaration for each primitive alias model with the correct Python type', () => {
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

    const expectedPythonTypeByModelName: Record<string, { type: string }> = {
      AnyAlias: { type: 'any' },
      UnknownAlias: { type: 'any' },
      NilAlias: { type: 'none' },
      StringAlias: { type: 'str' },
      BooleanAlias: { type: 'bool' },
      IntAlias: { type: 'int' },
      DoubleAlias: { type: 'float' },
      TimestampAlias: { type: 'datetime' },
    };

    expect(generation.declarations).toHaveLength(Object.keys(expectedPythonTypeByModelName).length);
    generation.declarations.forEach(decl => {
      expect(decl.type).toBe('alias');
      expect(decl.modelType).toEqual(expectedPythonTypeByModelName[decl.modelName]);
    });
  });

  it('converts container types (tuple, list, map) into Python tuple/list/dict alias declarations', () => {
    const s = schema.createSchemaFromDefinition({
      Coords: { model: 'alias', type: { type: 'tuple', elements: ['int', 'int'] } },
      Tags: { model: 'alias', type: { type: 'list', elementType: 'string' } },
      Lookup: { model: 'alias', type: { type: 'map', valueType: 'int' } },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations.find(d => d.modelName === 'Coords')?.modelType).toEqual({
      type: 'tuple',
      elements: [{ type: 'int' }, { type: 'int' }],
    });
    expect(generation.declarations.find(d => d.modelName === 'Tags')?.modelType).toEqual({
      type: 'list',
      elementType: { type: 'str' },
    });
    expect(generation.declarations.find(d => d.modelName === 'Lookup')?.modelType).toEqual({
      type: 'dict',
      valueType: { type: 'int' },
    });
  });

  it('emits an enum-class declaration for enum alias models preserving labels and values', () => {
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

    expect(generation.declarations.find(d => d.modelName === 'Color')).toMatchObject({
      type: 'enum-class',
      modelType: {
        type: 'enum-class',
        attributes: [
          { key: 'Red', value: 'red' },
          { key: 'Green', value: 'green' },
        ],
      },
    });
    expect(generation.declarations.find(d => d.modelName === 'Priority')).toMatchObject({
      type: 'enum-class',
      modelType: {
        type: 'enum-class',
        attributes: [
          { key: 'Low', value: 1 },
          { key: 'High', value: 2 },
        ],
      },
    });
  });

  it('emits a pydantic-class declaration for object alias models, preserving optional, docs, and additionalFields', () => {
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

    expect(generation.declarations[0]).toMatchObject({
      type: 'pydantic-class',
      modelName: 'Profile',
      modelType: {
        type: 'object-class',
        additionalAttributes: true,
        attributes: [
          { name: 'id', type: { type: 'str' }, optional: false, docs: 'The profile ID' },
          { name: 'bio', type: { type: 'str' }, optional: true, docs: null },
        ],
      },
    });
  });

  it('emits document models as pydantic-class declarations', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'document',
        path: 'profiles/{profileId}',
        docs: 'A profile document',
        type: { type: 'object', fields: { name: { type: 'string' } } },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'pydantic-class',
      modelName: 'Profile',
      modelDocs: 'A profile document',
    });
  });

  it('preserves model-level docs on declarations and defaults to null when absent', () => {
    const s = schema.createSchemaFromDefinition({
      Documented: { model: 'alias', type: 'string', docs: 'Documented alias' },
      Undocumented: { model: 'alias', type: 'string' },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations.find(d => d.modelName === 'Documented')?.modelDocs).toBe('Documented alias');
    expect(generation.declarations.find(d => d.modelName === 'Undocumented')?.modelDocs).toBeNull();
  });

  it('flattens nested object types into separate alias models', () => {
    const s = schema.createSchemaFromDefinition({
      User: {
        model: 'document',
        path: 'users/{userId}',
        type: {
          type: 'object',
          fields: {
            name: { type: 'string' },
            credentials: {
              type: { type: 'object', fields: { email: { type: 'string' } } },
            },
          },
        },
      },
    });

    const generation = createGenerator().generate(s);
    const declarationsByName = Object.fromEntries(generation.declarations.map(d => [d.modelName, d]));

    expect(declarationsByName.UserCredentials).toMatchObject({ type: 'pydantic-class' });
    expect(declarationsByName.User?.modelType).toMatchObject({
      type: 'object-class',
      attributes: expect.arrayContaining([
        expect.objectContaining({
          name: 'credentials',
          type: { type: 'alias', name: 'UserCredentials' },
        }),
      ]),
    });
  });

  it('flattens discriminated union variants into separate alias models referenced by name', () => {
    const s = schema.createSchemaFromDefinition({
      Pet: {
        model: 'alias',
        type: {
          type: 'union',
          discriminant: 'type',
          variants: [
            {
              type: 'object',
              fields: {
                type: { type: { type: 'literal', value: 'cat' } },
                lives_left: { type: 'int' },
              },
            },
            {
              type: 'object',
              fields: {
                type: { type: { type: 'literal', value: 'dog' } },
                breed: { type: 'string' },
              },
            },
          ],
        },
      },
    });

    const generation = createGenerator().generate(s);
    const declarationsByName = Object.fromEntries(generation.declarations.map(d => [d.modelName, d]));

    expect(declarationsByName.PetCat).toMatchObject({ type: 'pydantic-class' });
    expect(declarationsByName.PetDog).toMatchObject({ type: 'pydantic-class' });
    expect(declarationsByName.Pet?.modelType).toMatchObject({
      type: 'discriminated-union',
      discriminant: 'type',
      variants: [
        { type: 'alias', name: 'PetCat' },
        { type: 'alias', name: 'PetDog' },
      ],
    });
  });

  it('emits simple-union alias declarations for non-discriminated unions', () => {
    const s = schema.createSchemaFromDefinition({
      StringOrInt: { model: 'alias', type: { type: 'union', variants: ['string', 'int'] } },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'alias',
      modelName: 'StringOrInt',
      modelType: {
        type: 'simple-union',
        variants: [{ type: 'str' }, { type: 'int' }],
      },
    });
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

    const aliasIdx = generation.declarations.findIndex(d => d.modelName === 'Username');
    const documentIdx = generation.declarations.findIndex(d => d.modelName === 'Profile');
    expect(aliasIdx).toBeLessThan(documentIdx);
  });

  it('does not mutate the input schema', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'document',
        path: 'profiles/{profileId}',
        type: {
          type: 'object',
          fields: { credentials: { type: { type: 'object', fields: { email: { type: 'string' } } } } },
        },
      },
    });
    const snapshot = s.clone();

    createGenerator().generate(s);

    expect(s.aliasModels).toEqual(snapshot.aliasModels);
    expect(s.documentModels).toEqual(snapshot.documentModels);
  });
});
