import { createAliasModel, createSchema } from '../impl.js';
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
    it(`throws if an alias variant does not resolve to 'object'`, () => {
      const catObject: types.Object = {
        type: 'object',
        fields: [
          { name: 'type', type: { type: 'string-literal', value: 'cat' }, docs: null, optional: false },
          { name: 'lives_left', type: { type: 'int' }, docs: null, optional: false },
        ],
        additionalFields: false,
      };
      const catModel = createAliasModel({
        name: 'Cat',
        docs: null,
        value: catObject,
      });

      const dogMap: types.Map = {
        type: 'map',
        valueType: { type: 'string' },
      };
      const dogObject: types.Object = {
        type: 'object',
        fields: [
          { name: 'type', type: { type: 'string-literal', value: 'dog' }, docs: null, optional: false },
          { name: 'breed', type: { type: 'string' }, docs: null, optional: false },
        ],
        additionalFields: false,
      };
      const dogModel = createAliasModel({
        name: 'Dog',
        docs: null,
        value: dogMap,
      });

      const schema = createSchema();

      schema.addModelGroup([catModel, dogModel]);

      const t: types.DiscriminatedUnion = {
        type: 'discriminated-union',
        discriminant: 'type',
        variants: [
          {
            type: 'alias-variant',
            aliasType: { type: 'alias', name: 'Cat' },
            discriminantType: { type: 'string-literal', value: 'cat' },
            originalObjectType: catObject,
          },
          {
            type: 'alias-variant',
            aliasType: { type: 'alias', name: 'Dog' },
            discriminantType: { type: 'string-literal', value: 'dog' },
            // TODO: This is weird. Probably need to refactor
            originalObjectType: dogObject,
          },
        ],
      };

      expect(() => validateType(t, schema)).toThrow(Error);
    });

    it(`throws if a variant is missing the discriminant field`, () => {
      // TODO: Implement
      expect(true).toBe(true);
    });

    it(`throws if the discriminant field of a variant is not a literal string`, () => {
      // TODO: Implement
      expect(true).toBe(true);
    });

    it(`throws if the discriminant field of a variant is optional`, () => {
      // TODO: Implement
      expect(true).toBe(true);
    });

    it(`does not throw if the discriminated union is valid`, () => {
      // TODO: Implement
      expect(true).toBe(true);
    });
  });
});
