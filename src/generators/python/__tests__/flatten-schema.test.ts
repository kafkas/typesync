import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema.js';
import { schema } from '../../../schema/index.js';
import { deepFreeze } from '../../../util/deep-freeze.js';
import { flattenSchema } from '../_flatten-schema.js';
import { FlatObjectType, createFlatAliasModel, createFlatDocumentModel, createFlatSchema } from '../_schema.js';

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
      const s = schema.createSchema();
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
              docs: credentialsDocs,
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
        // TODO: Implement
        // docs: credentialsDocs,
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
              docs: credentialsDocs,
              optional: false,
            },
          ],
        },
      });

      s.addModels(aliasModel, userModel);

      return s;
    })();

    const flattenedSchema = flattenSchema(inputSchema);

    expect(flattenedSchema).toEqual(expectedFlattenedSchema);
  });
});
