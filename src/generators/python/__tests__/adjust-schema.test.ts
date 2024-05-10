import {
  createAliasModel,
  createDocumentModel,
  createSchema,
  createSchemaFromDefinition,
  schema,
} from '../../../schema/index.js';
import { deepFreeze } from '../../../util/deep-freeze.js';
import { adjustSchemaForPython } from '../_adjust-schema.js';

describe('adjustSchemaForPython()', () => {
  it('does not mutate input schema', () => {
    const inputSchema = createSchemaFromDefinition({
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

    deepFreeze(inputSchema);

    expect(() => {
      adjustSchemaForPython(inputSchema);
    }).not.toThrow();
  });

  it('returns a new schema', () => {
    const inputSchema = createSchemaFromDefinition({
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

    const flattenedSchema = adjustSchemaForPython(inputSchema);

    expect(flattenedSchema).not.toBe(inputSchema);
  });

  it(`does nothing when the schema is already flat`, () => {
    const inputSchema = createSchemaFromDefinition({
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

    const flattenedSchema = adjustSchemaForPython(inputSchema);

    expect([...flattenedSchema.aliasModels, ...flattenedSchema.documentModels]).toEqual([
      ...inputSchema.aliasModels,
      ...inputSchema.documentModels,
    ]);
  });

  it(`flattens nested object types and creates new aliases`, () => {
    const credentialsObjectType: schema.python.types.Object = {
      type: 'object',
      fields: [
        {
          type: { type: 'string' },
          name: 'email',
          docs: null,
          optional: false,
        },
        {
          type: { type: 'string' },
          name: 'password',
          docs: null,
          optional: false,
        },
      ],
      additionalFields: false,
    };

    const inputSchema = (() => {
      const s = createSchema();
      const userModel = createDocumentModel({
        name: 'User',
        docs: null,
        type: {
          type: 'object',
          fields: [
            {
              name: 'name',
              type: { type: 'string' },
              docs: null,
              optional: false,
            },
            {
              name: 'credentials',
              type: credentialsObjectType,
              docs: 'An object that represents user credentials',
              optional: false,
            },
          ],
          additionalFields: false,
        },
      });

      s.addModel(userModel);

      return s;
    })();

    const expectedFlattenedSchema = (() => {
      const s = schema.python.createSchema();
      const aliasModel = schema.python.createAliasModel({
        name: 'UserCredentials',
        docs: null,
        value: credentialsObjectType,
      });

      const userModel = schema.python.createDocumentModel({
        name: 'User',
        docs: null,
        type: {
          type: 'object',
          fields: [
            {
              name: 'name',
              type: { type: 'string' },
              docs: null,
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
          additionalFields: false,
        },
      });

      s.addModelGroup([aliasModel, userModel]);

      return s;
    })();

    const flattenedSchema = adjustSchemaForPython(inputSchema);

    expect(flattenedSchema).toEqual(expectedFlattenedSchema);
  });

  it(`flattens discriminated union variants and creates new aliases`, () => {
    const inputSchema = (() => {
      const s = createSchema();
      const petModel = createAliasModel({
        name: 'Pet',
        docs: null,
        value: {
          type: 'discriminated-union',
          discriminant: 'type',
          variants: [
            {
              type: 'object',
              fields: [
                { name: 'type', type: { type: 'string-literal', value: 'cat' }, docs: null, optional: false },
                { name: 'lives_left', type: { type: 'int' }, docs: null, optional: false },
              ],
              additionalFields: false,
            },
            {
              type: 'object',
              fields: [
                { name: 'type', type: { type: 'string-literal', value: 'dog' }, docs: null, optional: false },
                { name: 'breed', type: { type: 'string' }, docs: null, optional: false },
              ],
              additionalFields: false,
            },
          ],
        },
      });
      s.addModel(petModel);

      return s;
    })();

    const expectedFlattenedSchema = (() => {
      const s = schema.python.createSchema();
      const catModel = schema.python.createAliasModel({
        name: 'PetCat',
        docs: null,
        value: {
          type: 'object',
          fields: [
            { name: 'type', type: { type: 'string-literal', value: 'cat' }, docs: null, optional: false },
            { name: 'lives_left', type: { type: 'int' }, docs: null, optional: false },
          ],
          additionalFields: false,
        },
      });

      const dogModel = schema.python.createAliasModel({
        name: 'PetDog',
        docs: null,
        value: {
          type: 'object',
          fields: [
            { name: 'type', type: { type: 'string-literal', value: 'dog' }, docs: null, optional: false },
            { name: 'breed', type: { type: 'string' }, docs: null, optional: false },
          ],
          additionalFields: false,
        },
      });

      const petModel = schema.python.createAliasModel({
        name: 'Pet',
        docs: null,
        value: {
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

    const flattenedSchema = adjustSchemaForPython(inputSchema);

    expect(flattenedSchema).toEqual(expectedFlattenedSchema);
  });
});
