import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema';
import { schema } from '../../../schema';
import { deepFreeze } from '../../deep-freeze';
import { flattenSchema } from '../flatten-schema';

describe('flatten-schema', () => {
  it('does not mutate input schema', () => {
    const inputSchema = loadSchemaForTestDefinition('flat');

    deepFreeze(inputSchema);

    expect(() => {
      flattenSchema(inputSchema);
    }).not.toThrow();
  });

  it('returns a new schema', () => {
    const inputSchema = loadSchemaForTestDefinition('flat');
    const flattenedSchema = flattenSchema(inputSchema);

    expect(flattenedSchema).not.toBe(inputSchema);
  });

  it(`does nothing when the schema is "flat"`, () => {
    const inputSchema = loadSchemaForTestDefinition('flat');
    const flattenedSchema = flattenSchema(inputSchema);

    expect(flattenedSchema).toEqual(inputSchema);
  });

  it(`flattens the schema by creating new aliases`, () => {
    const credentialsDocs = 'An object that represents user credentials';
    const credentialsObjectType: schema.types.Object = {
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
        fieldsById: {
          name: {
            name: 'name',
            type: { type: 'string' },
            docs: undefined,
            optional: false,
          },
          credentials: {
            name: 'credentials',
            type: credentialsObjectType,
            docs: credentialsDocs,
            optional: false,
          },
        },
      });

      s.addModel(userModel);

      return s;
    })();

    const expectedFlattenedSchema = (() => {
      const s = schema.create();
      const aliasModel = schema.createAliasModel({
        // TODO: Implement these
        name: 'Placeholder',
        docs: undefined,
        // docs: credentialsDocs,
        value: credentialsObjectType,
      });

      const userModel = schema.createDocumentModel({
        name: 'User',
        docs: undefined,
        fieldsById: {
          name: {
            name: 'name',
            type: { type: 'string' },
            docs: undefined,
            optional: false,
          },
          credentials: {
            name: 'credentials',
            type: {
              type: 'alias',
              // TODO: Implement this
              name: 'Placeholder',
            },
            docs: credentialsDocs,
            optional: false,
          },
        },
      });

      s.addModels(aliasModel, userModel);

      return s;
    })();

    const flattenedSchema = flattenSchema(inputSchema);

    expect(flattenedSchema).toEqual(expectedFlattenedSchema);
  });
});
