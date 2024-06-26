import { StringBuilder } from '@proficient/ds';

import { assertNever } from '../../util/assert.js';
import type {
  Alias,
  Any,
  Boolean,
  Enum,
  List,
  Literal,
  Null,
  Number,
  Object,
  Record,
  String,
  Timestamp,
  Tuple,
  Type,
  Union,
  Unknown,
} from './_types.js';

export interface Expression {
  content: string;
}

export function expressionForAnyType(_t: Any): Expression {
  return { content: 'any' };
}

export function expressionForUnknownType(_t: Unknown): Expression {
  return { content: 'unknown' };
}

export function expressionForNullType(_t: Null): Expression {
  return { content: 'null' };
}

export function expressionForStringType(_t: String): Expression {
  return { content: 'string' };
}

export function expressionForBooleanType(_t: Boolean): Expression {
  return { content: 'boolean' };
}

export function expressionForNumberType(_t: Number): Expression {
  return { content: 'number' };
}

export function expressionForTimestampType(_t: Timestamp): Expression {
  return { content: 'firestore.Timestamp' };
}

export function expressionForLiteralType(t: Literal): Expression {
  switch (typeof t.value) {
    case 'string':
      return { content: `'${t.value}'` };
    case 'number':
      return { content: `${t.value}` };
    case 'boolean':
      return { content: `${t.value}` };
    default:
      assertNever(t.value);
  }
}

export function expressionForEnumType(t: Enum): Expression {
  const { members } = t;
  const content = members
    .map(({ value }) => {
      switch (typeof value) {
        case 'string':
          return `'${value}'`;
        case 'number':
          return `${value}`;
        default:
          assertNever(value);
      }
    })
    .join(' | ');
  return { content };
}

export function expressionForTupleType(t: Tuple): Expression {
  const commaSeparatedExpressions = t.elements.map(vt => expressionForType(vt).content).join(', ');
  return { content: `[${commaSeparatedExpressions}]` };
}

export function expressionForListType(t: List): Expression {
  const expression = expressionForType(t.elementType);
  return { content: `${expression.content}[]` };
}

export function expressionForRecordType(t: Record): Expression {
  const expression = expressionForType(t.valueType);
  return { content: `Record<string, ${expression.content}>` };
}

export function expressionForObjectType(t: Object): Expression {
  const { properties, additionalProperties } = t;
  const b = new StringBuilder();

  b.append(`{\n`);
  properties.forEach(prop => {
    if (prop.docs !== null) {
      b.append(`/** ${prop.docs} */\n`);
    }
    const expression = expressionForType(prop.type);
    b.append(`${prop.name}${prop.optional ? '?' : ''}: ${expression.content};\n`);
  });
  if (additionalProperties) {
    b.append('[K: string]: unknown;\n');
  }
  b.append(`}`);
  return { content: b.toString() };
}

export function expressionForUnionType(t: Union): Expression {
  const separatedExpressions = t.variants.map(vt => expressionForType(vt).content).join(' | ');
  return { content: `${separatedExpressions}` };
}

export function expressionForAliasType(t: Alias): Expression {
  return { content: t.name };
}

export function expressionForType(t: Type): Expression {
  switch (t.type) {
    case 'any':
      return expressionForAnyType(t);
    case 'unknown':
      return expressionForUnknownType(t);
    case 'null':
      return expressionForNullType(t);
    case 'string':
      return expressionForStringType(t);
    case 'boolean':
      return expressionForBooleanType(t);
    case 'number':
      return expressionForNumberType(t);
    case 'timestamp':
      return expressionForTimestampType(t);
    case 'literal':
      return expressionForLiteralType(t);
    case 'enum':
      return expressionForEnumType(t);
    case 'tuple':
      return expressionForTupleType(t);
    case 'list':
      return expressionForListType(t);
    case 'record':
      return expressionForRecordType(t);
    case 'object':
      return expressionForObjectType(t);
    case 'union':
      return expressionForUnionType(t);
    case 'alias':
      return expressionForAliasType(t);
    default:
      assertNever(t);
  }
}
