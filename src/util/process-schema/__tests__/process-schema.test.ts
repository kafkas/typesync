import { loadSchemaForTestDefinition } from '../../../../test/util/load-schema';
import { schema } from '../../../schema';
import { deepFreeze } from '../../deep-freeze';
import { processSchema } from '../process-schema';

describe('process-schema', () => {
  it('does not mutate input schema', () => {
    const inputSchema = loadSchemaForTestDefinition('flat');

    deepFreeze(inputSchema);

    expect(() => {
      processSchema(inputSchema);
    }).not.toThrow();
  });

  it('returns a new schema', () => {
    const inputSchema = loadSchemaForTestDefinition('flat');
    const processedSchema = processSchema(inputSchema);

    expect(processedSchema).not.toBe(inputSchema);
  });

  it(`does nothing when the schema is "flat"`, () => {
    const inputSchema = loadSchemaForTestDefinition('flat');
    const processedSchema = processSchema(inputSchema);

    expect(processedSchema).toEqual(inputSchema);
  });

  it(`flattens the schema by creating new aliases`, () => {
    const credentialsDocs = 'A map that represents user credentials';
    const credentialsMapType: schema.types.Map = {
      type: 'map',
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
            type: credentialsMapType,
            docs: credentialsDocs,
            optional: false,
          },
        },
      });
      s.models.push(userModel);
      return s;
    })();

    const expectedProcessedSchema = (() => {
      const s = schema.create();
      const aliasModel = schema.createAliasModel({
        name: 'UserCredentials',
        docs: credentialsDocs,
        value: credentialsMapType,
      });

      // TODO: Use something like s.addModel() instead
      s.models.push(aliasModel);

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
              name: 'UserCredentials',
            },
            docs: undefined,
            optional: false,
          },
        },
      });

      // TODO: Use something like s.addModel() instead
      s.models.push(userModel);

      return s;
    })();

    const processedSchema = processSchema(inputSchema);

    expect(processedSchema).toEqual(expectedProcessedSchema);
  });
});
