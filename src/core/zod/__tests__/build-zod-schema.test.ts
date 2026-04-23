import { Timestamp } from 'firebase-admin/firestore';

import { schema } from '../../../schema/index.js';
import { buildZodSchemaMap } from '../build-zod-schema.js';

function getSchemaForModel(s: schema.Schema, name: string) {
  const map = buildZodSchemaMap(s);
  const found = map.get(name);
  if (!found) throw new Error(`Model '${name}' not found in built Zod map.`);
  return found;
}

describe('buildZodSchemaMap()', () => {
  describe('primitive types', () => {
    const s = schema.createSchemaFromDefinition({
      StringAlias: { model: 'alias', type: 'string' },
      IntAlias: { model: 'alias', type: 'int' },
      DoubleAlias: { model: 'alias', type: 'double' },
      BoolAlias: { model: 'alias', type: 'boolean' },
      TimestampAlias: { model: 'alias', type: 'timestamp' },
      NilAlias: { model: 'alias', type: 'nil' },
      AnyAlias: { model: 'alias', type: 'any' },
      UnknownAlias: { model: 'alias', type: 'unknown' },
    });

    it('accepts valid primitives and rejects invalid ones', () => {
      expect(getSchemaForModel(s, 'StringAlias').safeParse('hi').success).toBe(true);
      expect(getSchemaForModel(s, 'StringAlias').safeParse(42).success).toBe(false);

      expect(getSchemaForModel(s, 'IntAlias').safeParse(42).success).toBe(true);
      expect(getSchemaForModel(s, 'IntAlias').safeParse(1.5).success).toBe(false);

      expect(getSchemaForModel(s, 'DoubleAlias').safeParse(1.5).success).toBe(true);
      expect(getSchemaForModel(s, 'DoubleAlias').safeParse('1.5').success).toBe(false);

      expect(getSchemaForModel(s, 'BoolAlias').safeParse(true).success).toBe(true);
      expect(getSchemaForModel(s, 'BoolAlias').safeParse(0).success).toBe(false);

      expect(getSchemaForModel(s, 'NilAlias').safeParse(null).success).toBe(true);
      expect(getSchemaForModel(s, 'NilAlias').safeParse(undefined).success).toBe(false);
    });

    it('accepts only firestore Timestamp instances for timestamp', () => {
      const ts = new Timestamp(1_700_000_000, 0);
      expect(getSchemaForModel(s, 'TimestampAlias').safeParse(ts).success).toBe(true);
      expect(getSchemaForModel(s, 'TimestampAlias').safeParse(new Date()).success).toBe(false);
      expect(getSchemaForModel(s, 'TimestampAlias').safeParse('2020-01-01').success).toBe(false);
    });
  });

  describe('enums and literals', () => {
    const s = schema.createSchemaFromDefinition({
      UserRole: {
        model: 'alias',
        type: {
          type: 'enum',
          members: [
            { label: 'ADMIN', value: 'admin' },
            { label: 'USER', value: 'user' },
          ],
        },
      },
      ExactFive: {
        model: 'alias',
        type: { type: 'literal', value: 5 },
      },
    });

    it('accepts only enum members', () => {
      expect(getSchemaForModel(s, 'UserRole').safeParse('admin').success).toBe(true);
      expect(getSchemaForModel(s, 'UserRole').safeParse('user').success).toBe(true);
      expect(getSchemaForModel(s, 'UserRole').safeParse('owner').success).toBe(false);
    });

    it('accepts only the literal value', () => {
      expect(getSchemaForModel(s, 'ExactFive').safeParse(5).success).toBe(true);
      expect(getSchemaForModel(s, 'ExactFive').safeParse(6).success).toBe(false);
    });
  });

  describe('collections and records', () => {
    const s = schema.createSchemaFromDefinition({
      Tags: {
        model: 'alias',
        type: { type: 'list', elementType: 'string' },
      },
      Lookup: {
        model: 'alias',
        type: { type: 'map', valueType: 'int' },
      },
      Pair: {
        model: 'alias',
        type: { type: 'tuple', elements: ['string', 'int'] },
      },
    });

    it('validates lists', () => {
      expect(getSchemaForModel(s, 'Tags').safeParse(['a', 'b']).success).toBe(true);
      expect(getSchemaForModel(s, 'Tags').safeParse(['a', 1]).success).toBe(false);
    });

    it('validates maps with string keys', () => {
      expect(getSchemaForModel(s, 'Lookup').safeParse({ a: 1, b: 2 }).success).toBe(true);
      expect(getSchemaForModel(s, 'Lookup').safeParse({ a: 'x' }).success).toBe(false);
    });

    it('validates tuples', () => {
      expect(getSchemaForModel(s, 'Pair').safeParse(['x', 1]).success).toBe(true);
      expect(getSchemaForModel(s, 'Pair').safeParse(['x']).success).toBe(false);
      expect(getSchemaForModel(s, 'Pair').safeParse(['x', 1, 2]).success).toBe(false);
    });
  });

  describe('object types', () => {
    it('enforces required and optional fields', () => {
      const s = schema.createSchemaFromDefinition({
        User: {
          model: 'document',
          path: 'users/{userId}',
          type: {
            type: 'object',
            fields: {
              username: { type: 'string' },
              age: { type: 'int', optional: true },
            },
          },
        },
      });
      const user = getSchemaForModel(s, 'User');
      expect(user.safeParse({ username: 'alice' }).success).toBe(true);
      expect(user.safeParse({ username: 'alice', age: 30 }).success).toBe(true);
      expect(user.safeParse({ age: 30 }).success).toBe(false);
    });

    it('rejects extra fields by default and accepts them when additionalFields is true', () => {
      const sStrict = schema.createSchemaFromDefinition({
        User: {
          model: 'document',
          path: 'users/{userId}',
          type: {
            type: 'object',
            fields: { username: { type: 'string' } },
          },
        },
      });
      const sOpen = schema.createSchemaFromDefinition({
        User: {
          model: 'document',
          path: 'users/{userId}',
          type: {
            type: 'object',
            fields: { username: { type: 'string' } },
            additionalFields: true,
          },
        },
      });

      const data = { username: 'alice', extra: 'oops' };
      expect(getSchemaForModel(sStrict, 'User').safeParse(data).success).toBe(false);
      expect(getSchemaForModel(sOpen, 'User').safeParse(data).success).toBe(true);
    });
  });

  describe('alias references', () => {
    it('resolves references between models', () => {
      const s = schema.createSchemaFromDefinition({
        Username: { model: 'alias', type: 'string' },
        User: {
          model: 'document',
          path: 'users/{userId}',
          type: {
            type: 'object',
            fields: { username: { type: 'Username' } },
          },
        },
      });
      expect(getSchemaForModel(s, 'User').safeParse({ username: 'alice' }).success).toBe(true);
      expect(getSchemaForModel(s, 'User').safeParse({ username: 1 }).success).toBe(false);
    });
  });

  describe('discriminated unions', () => {
    it('routes validation based on the discriminant', () => {
      const s = schema.createSchemaFromDefinition({
        Event: {
          model: 'alias',
          type: {
            type: 'union',
            discriminant: 'kind',
            variants: [
              {
                type: 'object',
                fields: {
                  kind: { type: { type: 'literal', value: 'click' } },
                  x: { type: 'int' },
                },
              },
              {
                type: 'object',
                fields: {
                  kind: { type: { type: 'literal', value: 'scroll' } },
                  dy: { type: 'int' },
                },
              },
            ],
          },
        },
      });
      const event = getSchemaForModel(s, 'Event');
      expect(event.safeParse({ kind: 'click', x: 10 }).success).toBe(true);
      expect(event.safeParse({ kind: 'scroll', dy: 50 }).success).toBe(true);
      expect(event.safeParse({ kind: 'click', dy: 50 }).success).toBe(false);
    });
  });
});
