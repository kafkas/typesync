import { InvalidModelError } from '../../errors/invalid-model.js';
import { createSchemaFromDefinition } from '../index.js';

describe('createSchemaFromDefinition()', () => {
  describe(`'enum' types`, () => {
    it(`throws 'InvalidModelError' if there are 0 members`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          UserRole: {
            model: 'alias',
            type: {
              type: 'enum',
              members: [],
            },
          },
        });

      expect(create).toThrow(InvalidModelError);
    });

    it(`throws 'InvalidModelError' if there are duplicate member values`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          UserRole: {
            model: 'alias',
            type: {
              type: 'enum',
              members: [
                { label: 'label1', value: 'value1' },
                { label: 'label2', value: 'value1' },
                { label: 'label3', value: 'value3' },
              ],
            },
          },
        });

      expect(create).toThrow(InvalidModelError);
    });

    it(`throws 'InvalidModelError' if there are duplicate member labels`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          UserRole: {
            model: 'alias',
            type: {
              type: 'enum',
              members: [
                { label: 'label1', value: 'value1' },
                { label: 'label1', value: 'value2' },
                { label: 'label3', value: 'value3' },
              ],
            },
          },
        });

      expect(create).toThrow(InvalidModelError);
    });

    it(`does not throw if there are multiple members with distinct values`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          UserRole: {
            model: 'alias',
            type: {
              type: 'enum',
              members: [
                { label: 'label1', value: 'value1' },
                { label: 'label2', value: 'value2' },
                { label: 'label3', value: 'value3' },
              ],
            },
          },
        });

      expect(create).not.toThrow();
    });
  });

  describe(`'discriminated-union' types`, () => {
    it(`throws 'InvalidModelError' if a discriminated union alias variant does not resolve to 'object'`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          Cat: {
            model: 'alias',
            type: {
              type: 'object',
              fields: {
                type: {
                  type: { type: 'literal', value: 'cat' },
                },
                lives_left: {
                  type: 'int',
                },
              },
            },
          },
          Dog: {
            model: 'alias',
            type: {
              type: 'map',
              valueType: 'string',
            },
          },
          Pet: {
            model: 'alias',
            type: {
              type: 'union',
              discriminant: 'type',
              variants: ['Cat', 'Dog'],
            },
          },
        });

      expect(create).toThrow(InvalidModelError);
    });

    it(`throws 'InvalidModelError' if a discriminated union variant is missing the discriminant field`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          Pet: {
            model: 'alias',
            type: {
              type: 'union',
              discriminant: 'type',
              variants: [
                {
                  type: 'object',
                  fields: {
                    type: {
                      type: { type: 'literal', value: 'cat' },
                    },
                    lives_left: {
                      type: 'int',
                    },
                  },
                },
                {
                  type: 'object',
                  fields: {
                    breed: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        });

      expect(create).toThrow(InvalidModelError);
    });

    it(`throws 'InvalidModelError' if a discriminant field is not a literal string`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          Pet: {
            model: 'alias',
            type: {
              type: 'union',
              discriminant: 'type',
              variants: [
                {
                  type: 'object',
                  fields: {
                    type: {
                      type: 'string',
                    },
                    lives_left: {
                      type: 'int',
                    },
                  },
                },
                {
                  type: 'object',
                  fields: {
                    type: {
                      type: 'string',
                    },
                    breed: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        });

      expect(create).toThrow(InvalidModelError);
    });

    it(`throws 'InvalidModelError' if a discriminant field is optional`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          Pet: {
            model: 'alias',
            type: {
              type: 'union',
              discriminant: 'type',
              variants: [
                {
                  type: 'object',
                  fields: {
                    type: {
                      type: { type: 'literal', value: 'cat' },
                      optional: true,
                    },
                    lives_left: {
                      type: 'int',
                    },
                  },
                },
                {
                  type: 'object',
                  fields: {
                    type: {
                      type: { type: 'literal', value: 'dog' },
                    },
                    breed: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        });

      expect(create).toThrow(InvalidModelError);
    });

    it(`does not throw if the discriminated union is valid`, async () => {
      const create = () =>
        createSchemaFromDefinition({
          Cat: {
            model: 'alias',
            type: {
              type: 'object',
              fields: {
                type: {
                  type: { type: 'literal', value: 'cat' },
                },
                lives_left: {
                  type: 'int',
                },
              },
            },
          },
          Pet: {
            model: 'alias',
            type: {
              type: 'union',
              discriminant: 'type',
              variants: [
                'Cat',
                {
                  type: 'object',
                  fields: {
                    type: {
                      type: { type: 'literal', value: 'dog' },
                    },
                    breed: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        });

      expect(create).not.toThrow();
    });
  });
});
