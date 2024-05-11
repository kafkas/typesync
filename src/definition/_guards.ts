import { assertNeverNoThrow } from '../util/assert.js';
import type { types } from './types/index.js';

export function isPrimitiveType(candidate: unknown): candidate is types.Primitive {
  const c = candidate as types.Primitive;
  switch (c) {
    case 'any':
    case 'unknown':
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'double':
    case 'timestamp':
      return true;
    default:
      assertNeverNoThrow(c);
      return false;
  }
}

export function isStringLiteralType(t: types.Type): t is types.StringLiteral {
  if (typeof t !== 'object' || t.type !== 'literal') return false;
  return typeof t.value === 'string';
}

export function isIntLiteralType(t: types.Type): t is types.IntLiteral {
  if (typeof t !== 'object' || t.type !== 'literal') return false;
  return typeof t.value === 'number';
}

export function isBooleanLiteralType(t: types.Type): t is types.BooleanLiteral {
  if (typeof t !== 'object' || t.type !== 'literal') return false;
  return typeof t.value === 'boolean';
}

export function isStringEnumType(t: types.Type): t is types.StringEnum {
  if (typeof t !== 'object' || t.type !== 'enum') return false;
  return t.members.every(member => typeof member.value === 'string');
}

export function isIntEnumType(t: types.Type): t is types.IntEnum {
  if (typeof t !== 'object' || t.type !== 'enum') return false;
  return t.members.every(member => typeof member.value === 'number');
}

export function isObjectType(t: types.Type): t is types.Object {
  return typeof t === 'object' && t.type === 'object';
}

export function isDiscriminatedUnionType(t: types.Type): t is types.DiscriminatedUnion {
  if (typeof t !== 'object' || t.type !== 'union') return false;
  return typeof (t as types.DiscriminatedUnion).discriminant === 'string';
}

export function isSimpleUnionType(t: types.Type): t is types.SimpleUnion {
  if (typeof t !== 'object' || t.type !== 'union') return false;
  return typeof (t as types.DiscriminatedUnion).discriminant === 'undefined';
}

export function isAliasType(t: types.Type): t is types.Alias {
  return !isPrimitiveType(t) && typeof t === 'string';
}
