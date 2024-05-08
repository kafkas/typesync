import { createAliasModel, createSchema, createSchemaWithModels } from '../impl.js';
import type { types } from '../types/index.js';

describe('schema.parseType()', () => {
  describe('unknown', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Unknown = { type: 'unknown' };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('nil', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Nil = { type: 'nil' };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('string', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.String = { type: 'string' };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('boolean', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Boolean = { type: 'boolean' };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('int', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Int = { type: 'int' };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('double', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Double = { type: 'double' };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('timestamp', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Timestamp = { type: 'timestamp' };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('string-literal', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.StringLiteral = {
        type: 'string-literal',
        value: 'abc',
      };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('int-literal', () => {
    it('throws if the literal value is not an integer', () => {
      const schema = createSchema();
      const t: types.IntLiteral = {
        type: 'int-literal',
        value: Math.PI,
      };
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.IntLiteral = {
        type: 'int-literal',
        value: 1,
      };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('boolean-literal', () => {
    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.BooleanLiteral = {
        type: 'boolean-literal',
        value: false,
      };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('string-enum', () => {
    it('throws if there are 0 members', () => {
      const schema = createSchema();
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [],
      };
      expect(() => schema.parseType(t)).toThrow(Error);
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
      expect(() => schema.parseType(t)).toThrow(Error);
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
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it(`does not throw if the type is valid`, () => {
      const schema = createSchema();
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [
          { label: 'label1', value: 'value1' },
          { label: 'label2', value: 'value2' },
          { label: 'label3', value: 'value3' },
        ],
      };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('int-enum', () => {
    it('throws if there are 0 members', () => {
      const schema = createSchema();
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [],
      };
      expect(() => schema.parseType(t)).toThrow(Error);
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
      expect(() => schema.parseType(t)).toThrow(Error);
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
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it(`throws if a member value is not an integer`, () => {
      const schema = createSchema();
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [
          { label: 'label1', value: 1 },
          { label: 'label2', value: 2.1 },
        ],
      };
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it(`does not throw if the type is valid`, () => {
      const schema = createSchema();
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [
          { label: 'label1', value: 1 },
          { label: 'label2', value: 2 },
          { label: 'label3', value: 3 },
        ],
      };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('tuple', () => {
    it('throws if an element type is invalid', () => {
      const schema = createSchema();
      const t: types.Tuple = {
        type: 'tuple',
        elements: [{ type: 'int-enum', members: [{ label: 'a', value: 1.23 }] }, { type: 'int' }],
      };
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Tuple = { type: 'tuple', elements: [{ type: 'int' }, { type: 'int' }] };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('list', () => {
    it('throws if the element type is invalid', () => {
      const schema = createSchema();
      const t: types.List = {
        type: 'list',
        elementType: {
          type: 'int-enum',
          members: [{ label: 'a', value: 1.23 }],
        },
      };
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.List = { type: 'list', elementType: { type: 'string' } };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('map', () => {
    it('throws if the value type is invalid', () => {
      const schema = createSchema();
      const t: types.Map = {
        type: 'map',
        valueType: {
          type: 'int-enum',
          members: [{ label: 'a', value: 1.23 }],
        },
      };
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Map = { type: 'map', valueType: { type: 'string' } };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('object', () => {
    it('throws if a field type is invalid', () => {
      const schema = createSchema();
      const t: types.Object = {
        type: 'object',
        fields: [
          {
            name: 'name',
            type: {
              type: 'int-enum',
              members: [{ label: 'a', value: 1.23 }],
            },
            optional: false,
            docs: null,
          },
        ],
        additionalFields: false,
      };
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it('does not throw if the type is valid', () => {
      const schema = createSchema();
      const t: types.Object = {
        type: 'object',
        fields: [
          {
            name: 'name',
            type: {
              type: 'int-enum',
              members: [{ label: 'a', value: 1 }],
            },
            optional: false,
            docs: null,
          },
        ],
        additionalFields: false,
      };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('alias', () => {
    it(`throws if 'name' refers to a nonexistent model`, () => {
      const schema = createSchema();
      const t: types.Alias = {
        type: 'alias',
        name: 'User',
      };
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it('does not throw if the type is valid', () => {
      const userModel = createAliasModel({
        name: 'User',
        docs: null,
        value: {
          type: 'object',
          fields: [{ name: 'name', type: { type: 'string' }, docs: null, optional: false }],
          additionalFields: false,
        },
      });
      const schema = createSchemaWithModels([userModel]);
      const t: types.Alias = {
        type: 'alias',
        name: 'User',
      };
      expect(() => schema.parseType(t)).not.toThrow();
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
      expect(() => schema.parseType(t)).toThrow(Error);
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

      expect(() => schema.parseType(t)).toThrow(Error);
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

      expect(() => schema.parseType(t)).toThrow(Error);
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

      expect(() => schema.parseType(t)).toThrow(Error);
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

      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it(`does not throw if the type is valid`, () => {
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

      expect(() => schema.parseType(t)).not.toThrow();
    });
  });

  describe('simple-union', () => {
    it(`throws if the union has 0 variants`, () => {
      const schema = createSchema();
      const t: types.SimpleUnion = {
        type: 'simple-union',
        variants: [],
      };
      expect(() => schema.parseType(t)).toThrow(Error);
    });

    it(`does not throw if the type is valid`, () => {
      const schema = createSchema();
      const t: types.SimpleUnion = {
        type: 'simple-union',
        variants: [{ type: 'string' }, { type: 'int' }],
      };
      expect(() => schema.parseType(t)).not.toThrow();
    });
  });
});
