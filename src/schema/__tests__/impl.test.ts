import { InvalidModelError } from '../../errors/invalid-model.js';
import { schema } from '../index.js';

describe('schema.createFromDefinition()', () => {
  describe(`'discriminated-union' types`, () => {
    it(`throws error if a discriminated union alias variant does not resolve to 'object'`, async () => {
      const create = () =>
        schema.createFromDefinition({
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

    it('throws error if a discriminated union variant is missing the discriminant field', async () => {
      const create = () =>
        schema.createFromDefinition({
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

    it('throws error if a discriminant field is not a literal string', async () => {
      const create = () =>
        schema.createFromDefinition({
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

    it(`does not throw if the discriminated union is valid`, async () => {
      const create = () =>
        schema.createFromDefinition({
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
