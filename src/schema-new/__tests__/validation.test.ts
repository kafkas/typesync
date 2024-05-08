import { createAliasModel, createSchema, createSchemaWithModels } from '../impl.js';
import type { types } from '../types/index.js';
import { validateType } from '../types/parse.js';

describe('schema type validator', () => {
  describe('string-enum', () => {
    it('throws if there are 0 members', () => {
      const schema = createSchema();
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [],
      };
      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if there are duplicate member values`, () => {
      const schema = createSchema();
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [
          { label: 'label1', value: 'value1' },
          { label: 'label2', value: 'value1' },
          { label: 'label3', value: 'value3' },
        ],
      };
      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if there are duplicate member labels`, () => {
      const schema = createSchema();
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [
          { label: 'label1', value: 'value1' },
          { label: 'label1', value: 'value2' },
          { label: 'label3', value: 'value3' },
        ],
      };
      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`does not throw if there are multiple members with distinct values`, () => {
      const schema = createSchema();
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [
          { label: 'label1', value: 'value1' },
          { label: 'label2', value: 'value2' },
          { label: 'label3', value: 'value3' },
        ],
      };
      expect(() => validateType(t, schema)).not.toThrow();
    });
  });

  describe('int-enum', () => {
    it('throws if there are 0 members', () => {
      const schema = createSchema();
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [],
      };
      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if there are duplicate member values`, () => {
      const schema = createSchema();
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [
          { label: 'label1', value: 1 },
          { label: 'label2', value: 1 },
          { label: 'label3', value: 2 },
        ],
      };
      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if there are duplicate member labels`, () => {
      const schema = createSchema();
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [
          { label: 'label1', value: 1 },
          { label: 'label1', value: 2 },
          { label: 'label3', value: 3 },
        ],
      };
      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`does not throw if there are multiple members with distinct values`, () => {
      const schema = createSchema();
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [
          { label: 'label1', value: 1 },
          { label: 'label2', value: 2 },
          { label: 'label3', value: 3 },
        ],
      };
      expect(() => validateType(t, schema)).not.toThrow();
    });
  });

  describe('discriminated-union', () => {
    it(`throws if the union has 0 variants`, () => {
      const schema = createSchema();
      const t: types.DiscriminatedUnion = {
        type: 'discriminated-union',
        discriminant: 'type',
        variants: [],
      };
      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if an alias variant does not resolve to 'object'`, () => {
      const catModel = createAliasModel({
        name: 'Cat',
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
      const dogModel = createAliasModel({
        name: 'Dog',
        docs: null,
        value: {
          type: 'map',
          valueType: { type: 'string' },
        },
      });
      const schema = createSchemaWithModels([catModel, dogModel]);

      const t: types.DiscriminatedUnion = {
        type: 'discriminated-union',
        discriminant: 'type',
        variants: [
          { type: 'alias', name: catModel.name },
          { type: 'alias', name: dogModel.name },
        ],
      };

      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if a variant is missing the discriminant field`, () => {
      const schema = createSchema();

      const t: types.DiscriminatedUnion = {
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
            fields: [{ name: 'breed', type: { type: 'string' }, docs: null, optional: false }],
            additionalFields: false,
          },
        ],
      };

      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if the discriminant field of a variant is not a literal string`, () => {
      const schema = createSchema();

      const t: types.DiscriminatedUnion = {
        type: 'discriminated-union',
        discriminant: 'type',
        variants: [
          {
            type: 'object',
            fields: [
              { name: 'type', type: { type: 'string' }, docs: null, optional: false },
              { name: 'breed', type: { type: 'string' }, docs: null, optional: false },
            ],
            additionalFields: false,
          },
        ],
      };

      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if the discriminant field of a variant is optional`, () => {
      const schema = createSchema();

      const t: types.DiscriminatedUnion = {
        type: 'discriminated-union',
        discriminant: 'type',
        variants: [
          {
            type: 'object',
            fields: [
              { name: 'type', type: { type: 'string-literal', value: 'cat' }, optional: true, docs: null },
              { name: 'lives_left', type: { type: 'int' }, optional: false, docs: null },
            ],
            additionalFields: false,
          },
        ],
      };

      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`does not throw if the discriminated union is valid`, () => {
      const schema = createSchema();

      const t: types.DiscriminatedUnion = {
        type: 'discriminated-union',
        discriminant: 'type',
        variants: [
          {
            type: 'object',
            fields: [
              { name: 'type', type: { type: 'string-literal', value: 'cat' }, optional: false, docs: null },
              { name: 'lives_left', type: { type: 'int' }, optional: false, docs: null },
            ],
            additionalFields: false,
          },
          {
            type: 'object',
            fields: [
              { name: 'type', type: { type: 'string-literal', value: 'dog' }, optional: false, docs: null },
              { name: 'breed', type: { type: 'string' }, optional: false, docs: null },
            ],
            additionalFields: false,
          },
        ],
      };

      expect(() => validateType(t, schema)).not.toThrow();
    });
  });
});
