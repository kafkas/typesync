import { schema } from '../../../schema/index.js';
import { deepFreeze } from '../../../util/deep-freeze.js';
import { flattenSchema } from '../_flatten-schema.js';
import { FlatObjectType, createFlatAliasModel, createFlatDocumentModel, createFlatSchema } from '../_schema.js';

describe('flatten-schema', () => {
  it('does not mutate input schema', () => {
    const inputSchema = schema.createFromDefinition({
      SomeAliasModel: {
        model: 'alias',
        type: 'string',
      },
      SomeDocumentModel: {
        model: 'document',
        type: {
          type: 'object',
          fields: {
            field1: {
              type: 'SomeAliasModell',
            },
          },
        },
      },
    });

    deepFreeze(inputSchema);

    expect(() => {
      flattenSchema(inputSchema);
    }).not.toThrow();
  });

  it('returns a new schema', () => {
    const inputSchema = schema.createFromDefinition({
      SomeAliasModel: {
        model: 'alias',
        type: 'string',
      },
      SomeDocumentModel: {
        model: 'document',
        type: {
          type: 'object',
          fields: {
            field1: {
              type: 'SomeAliasModel',
            },
          },
        },
      },
    });

    const flattenedSchema = flattenSchema(inputSchema);

    expect(flattenedSchema).not.toBe(inputSchema);
  });

  it(`does nothing when the schema is "flat"`, () => {
    const inputSchema = schema.createFromDefinition({
      SomeAliasModel: {
        model: 'alias',
        type: 'string',
      },
      SomeDocumentModel: {
        model: 'document',
        type: {
          type: 'object',
          fields: {
            field1: {
              type: 'SomeAliasModel',
            },
          },
        },
      },
    });

    const flattenedSchema = flattenSchema(inputSchema);

    expect(flattenedSchema).toEqual(inputSchema);
  });

  it(`flattens nested object types and creates new aliases`, () => {
    const credentialsObjectType: FlatObjectType = {
      type: 'object',
      fields: [
        {
          type: { type: 'string' },
          name: 'email',
          docs: undefined,
          optional: false,
        },
        {
          type: { type: 'string' },
          name: 'password',
          docs: undefined,
          optional: false,
        },
      ],
    };

    const inputSchema = (() => {
      const s = schema.create();
      const userModel = schema.createDocumentModel({
        name: 'User',
        docs: undefined,
        type: {
          type: 'object',
          fields: [
            {
              name: 'name',
              type: { type: 'string' },
              docs: undefined,
              optional: false,
            },
            {
              name: 'credentials',
              type: credentialsObjectType,
              docs: 'An object that represents user credentials',
              optional: false,
            },
          ],
        },
      });

      s.addModel(userModel);

      return s;
    })();

    const expectedFlattenedSchema = (() => {
      const s = createFlatSchema();
      const aliasModel = createFlatAliasModel({
        name: 'UserCredentials',
        docs: undefined,
        type: credentialsObjectType,
      });

      const userModel = createFlatDocumentModel({
        name: 'User',
        docs: undefined,
        type: {
          type: 'object',
          fields: [
            {
              name: 'name',
              type: { type: 'string' },
              docs: undefined,
              optional: false,
            },
            {
              name: 'credentials',
              type: {
                type: 'alias',
                name: 'UserCredentials',
              },
              docs: 'An object that represents user credentials',
              optional: false,
            },
          ],
        },
      });

      s.addModelGroup([aliasModel, userModel]);

      return s;
    })();

    const flattenedSchema = flattenSchema(inputSchema);

    expect(flattenedSchema).toEqual(expectedFlattenedSchema);
  });

  it(`flattens discriminated union variants and creates new aliases`, () => {
    const inputSchema = (() => {
      const s = schema.create();
      const petModel = schema.createAliasModel({
        name: 'Pet',
        docs: undefined,
        value: {
          type: 'discriminated-union',
          discriminant: 'type',
          variants: [
            {
              type: 'object',
              fields: [
                { name: 'type', type: { type: 'literal', value: 'cat' }, docs: undefined, optional: false },
                { name: 'lives_left', type: { type: 'int' }, docs: undefined, optional: false },
              ],
            },
            {
              type: 'object',
              fields: [
                { name: 'type', type: { type: 'literal', value: 'dog' }, docs: undefined, optional: false },
                { name: 'breed', type: { type: 'string' }, docs: undefined, optional: false },
              ],
            },
          ],
        },
      });
      s.addModel(petModel);

      return s;
    })();

    const expectedFlattenedSchema = (() => {
      const s = createFlatSchema();
      const catModel = createFlatAliasModel({
        name: 'PetCat',
        docs: undefined,
        type: {
          type: 'object',
          fields: [
            { name: 'type', type: { type: 'literal', value: 'cat' }, docs: undefined, optional: false },
            { name: 'lives_left', type: { type: 'int' }, docs: undefined, optional: false },
          ],
        },
      });

      const dogModel = createFlatAliasModel({
        name: 'PetDog',
        docs: undefined,
        type: {
          type: 'object',
          fields: [
            { name: 'type', type: { type: 'literal', value: 'dog' }, docs: undefined, optional: false },
            { name: 'breed', type: { type: 'string' }, docs: undefined, optional: false },
          ],
        },
      });

      const petModel = createFlatAliasModel({
        name: 'Pet',
        docs: undefined,
        type: {
          type: 'discriminated-union',
          discriminant: 'type',
          variants: [
            {
              type: 'alias',
              name: 'PetCat',
            },
            {
              type: 'alias',
              name: 'PetDog',
            },
          ],
        },
      });

      s.addModelGroup([catModel, dogModel, petModel]);

      return s;
    })();

    const flattenedSchema = flattenSchema(inputSchema);

    expect(flattenedSchema).toEqual(expectedFlattenedSchema);
  });
});
