import {
  SwiftDocumentIdPropertyCollidesWithFieldError,
  SwiftPropertyNameCollisionError,
} from '../../../errors/generator.js';
import { schema } from '../../../schema/index.js';
import { createSwiftGenerator } from '../_impl.js';

function createGenerator() {
  return createSwiftGenerator({ target: 'firebase@10' });
}

describe('SwiftGeneratorImpl', () => {
  it('produces an empty generation for an empty schema', () => {
    const generation = createGenerator().generate(schema.createSchema());
    expect(generation).toEqual({ type: 'swift', declarations: [] });
  });

  it('emits a typealias declaration for each primitive alias model', () => {
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

    const expectedSwiftTypeByModelName: Record<string, { type: string }> = {
      AnyAlias: { type: 'any' },
      UnknownAlias: { type: 'any' },
      NilAlias: { type: 'nil' },
      StringAlias: { type: 'string' },
      BooleanAlias: { type: 'bool' },
      IntAlias: { type: 'int' },
      DoubleAlias: { type: 'double' },
      TimestampAlias: { type: 'date' },
    };

    expect(generation.declarations).toHaveLength(Object.keys(expectedSwiftTypeByModelName).length);
    generation.declarations.forEach(decl => {
      expect(decl.type).toBe('typealias');
      expect(decl.modelType).toEqual(expectedSwiftTypeByModelName[decl.modelName]);
    });
  });

  it('converts container types (tuple, list, map) into Swift tuple/list/dictionary typealiases', () => {
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
      elementType: { type: 'string' },
    });
    expect(generation.declarations.find(d => d.modelName === 'Lookup')?.modelType).toEqual({
      type: 'dictionary',
      valueType: { type: 'int' },
    });
  });

  it('emits a string-enum declaration for string enum alias models', () => {
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
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'string-enum',
      modelName: 'Color',
      modelType: {
        type: 'string-enum',
        cases: [
          { key: 'Red', value: 'red' },
          { key: 'Green', value: 'green' },
        ],
      },
    });
  });

  it('emits an int-enum declaration for int enum alias models', () => {
    const s = schema.createSchemaFromDefinition({
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

    expect(generation.declarations[0]).toMatchObject({
      type: 'int-enum',
      modelType: {
        type: 'int-enum',
        cases: [
          { key: 'Low', value: 1 },
          { key: 'High', value: 2 },
        ],
      },
    });
  });

  it('emits a struct declaration for object alias models, splitting literal vs regular properties', () => {
    const s = schema.createSchemaFromDefinition({
      Cat: {
        model: 'alias',
        type: {
          type: 'object',
          fields: {
            type: { type: { type: 'literal', value: 'cat' }, docs: 'The discriminator' },
            name: { type: 'string' },
            lives: { type: 'int', optional: true },
          },
        },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'struct',
      modelName: 'Cat',
      modelType: {
        type: 'struct',
        literalProperties: [
          {
            originalName: 'type',
            docs: 'The discriminator',
            type: { type: 'string' },
            literalValue: '"cat"',
          },
        ],
        regularProperties: [
          { originalName: 'name', type: { type: 'string' }, optional: false, docs: null },
          { originalName: 'lives', type: { type: 'int' }, optional: true, docs: null },
        ],
      },
    });
  });

  it('emits a discriminated-union-enum declaration with cases for each variant', () => {
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
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations.find(d => d.modelName === 'Pet')).toMatchObject({
      type: 'discriminated-union-enum',
      modelType: {
        type: 'discriminated-union-enum',
        discriminant: 'type',
        values: [
          { structName: 'Cat', discriminantValue: 'cat' },
          { structName: 'Dog', discriminantValue: 'dog' },
        ],
      },
    });
  });

  it('emits a simple-union-enum declaration with one case per variant', () => {
    const s = schema.createSchemaFromDefinition({
      Mixed: { model: 'alias', type: { type: 'union', variants: ['string', 'int'] } },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations.find(d => d.modelName === 'Mixed')).toMatchObject({
      type: 'simple-union-enum',
      modelType: {
        type: 'simple-union-enum',
        values: [{ type: { type: 'string' } }, { type: { type: 'int' } }],
      },
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

  it('emits document models as struct declarations', () => {
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
      type: 'struct',
      modelName: 'Profile',
      modelDocs: 'A profile document',
    });
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
              type: {
                type: 'object',
                fields: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
      },
    });

    const generation = createGenerator().generate(s);
    const declarationsByName = Object.fromEntries(generation.declarations.map(d => [d.modelName, d]));

    expect(declarationsByName.UserCredentials).toMatchObject({ type: 'struct' });
    expect(declarationsByName.User?.modelType).toMatchObject({
      type: 'struct',
      regularProperties: [
        { originalName: 'name', type: { type: 'string' } },
        { originalName: 'credentials', type: { type: 'alias', name: 'UserCredentials' } },
      ],
    });
  });

  it('flattens nested discriminated unions into a typealias model that points to its variants', () => {
    const s = schema.createSchemaFromDefinition({
      User: {
        model: 'document',
        path: 'users/{userId}',
        type: {
          type: 'object',
          fields: {
            pet: {
              type: {
                type: 'union',
                discriminant: 'type',
                variants: [
                  {
                    type: 'object',
                    fields: {
                      type: { type: { type: 'literal', value: 'cat' } },
                      lives: { type: 'int' },
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
          },
        },
      },
    });

    const generation = createGenerator().generate(s);
    const declNames = generation.declarations.map(d => d.modelName);

    expect(declNames).toContain('UserPet');
    expect(declNames).toContain('UserPetCat');
    expect(declNames).toContain('UserPetDog');
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

    const lastAliasIdx = generation.declarations.findIndex(d => d.modelName === 'Username');
    const documentIdx = generation.declarations.findIndex(d => d.modelName === 'Profile');
    expect(lastAliasIdx).toBeLessThan(documentIdx);
  });

  it('emits document model structs with a default `id` documentIdProperty', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'document',
        path: 'profiles/{profileId}',
        type: { type: 'object', fields: { name: { type: 'string' } } },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'struct',
      modelType: { type: 'struct', documentIdProperty: { name: 'id' } },
    });
  });

  it('emits alias-derived structs with a null documentIdProperty (no `@DocumentID` is generated)', () => {
    const s = schema.createSchemaFromDefinition({
      Cat: {
        model: 'alias',
        type: { type: 'object', fields: { name: { type: 'string' } } },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'struct',
      modelType: { type: 'struct', documentIdProperty: null },
    });
  });

  it('defaults each property name to camelCase(originalName) when no `swift.name` override is set', () => {
    const s = schema.createSchemaFromDefinition({
      Cat: {
        model: 'alias',
        type: { type: 'object', fields: { lives_left: { type: 'int' } } },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'struct',
      modelType: {
        regularProperties: [{ originalName: 'lives_left', name: 'livesLeft' }],
      },
    });
  });

  it('uses `swift.name` to override the generated Swift property name without changing the Firestore field name', () => {
    const s = schema.createSchemaFromDefinition({
      Cat: {
        model: 'alias',
        type: {
          type: 'object',
          fields: {
            display_name: { type: 'string', swift: { name: 'displayName' } },
            kind: { type: 'string' },
          },
        },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'struct',
      modelType: {
        documentIdProperty: null,
        regularProperties: [
          { originalName: 'display_name', name: 'displayName' },
          { originalName: 'kind', name: 'kind' },
        ],
      },
    });
  });

  it('uses `swift.documentIdProperty.name` to rename the auto-generated @DocumentID property', () => {
    const s = schema.createSchemaFromDefinition({
      Project: {
        model: 'document',
        path: 'projects/{projectId}',
        swift: { documentIdProperty: { name: 'documentId' } },
        type: {
          type: 'object',
          fields: { id: { type: 'string' }, name: { type: 'string' } },
        },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.declarations[0]).toMatchObject({
      type: 'struct',
      modelType: {
        documentIdProperty: { name: 'documentId' },
        regularProperties: [
          { originalName: 'id', name: 'id' },
          { originalName: 'name', name: 'name' },
        ],
      },
    });
  });

  it('throws SwiftDocumentIdPropertyCollidesWithFieldError when a document model has a body field whose Firestore key matches the @DocumentID property name', () => {
    const s = schema.createSchemaFromDefinition({
      Project: {
        model: 'document',
        path: 'projects/{projectId}',
        type: {
          type: 'object',
          fields: {
            id: { type: 'string', docs: 'The ID of the project' },
            completed: { type: 'boolean' },
          },
        },
      },
    });

    expect(() => createGenerator().generate(s)).toThrow(SwiftDocumentIdPropertyCollidesWithFieldError);
  });

  it('does not throw when the colliding @DocumentID property is renamed away from the conflicting field key', () => {
    const s = schema.createSchemaFromDefinition({
      Project: {
        model: 'document',
        path: 'projects/{projectId}',
        swift: { documentIdProperty: { name: 'documentId' } },
        type: {
          type: 'object',
          fields: {
            id: { type: 'string' },
            completed: { type: 'boolean' },
          },
        },
      },
    });

    expect(() => createGenerator().generate(s)).not.toThrow();
  });

  it('still throws if the user renames the @DocumentID property to a name that collides with another body field key', () => {
    const s = schema.createSchemaFromDefinition({
      Project: {
        model: 'document',
        path: 'projects/{projectId}',
        swift: { documentIdProperty: { name: 'documentId' } },
        type: {
          type: 'object',
          fields: { documentId: { type: 'string' } },
        },
      },
    });

    expect(() => createGenerator().generate(s)).toThrow(SwiftDocumentIdPropertyCollidesWithFieldError);
  });

  it('throws SwiftPropertyNameCollisionError when two fields rename to the same Swift property name', () => {
    const s = schema.createSchemaFromDefinition({
      Project: {
        model: 'document',
        path: 'projects/{projectId}',
        type: {
          type: 'object',
          fields: {
            first_name: { type: 'string', swift: { name: 'displayName' } },
            last_name: { type: 'string', swift: { name: 'displayName' } },
          },
        },
      },
    });

    expect(() => createGenerator().generate(s)).toThrow(SwiftPropertyNameCollisionError);
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
