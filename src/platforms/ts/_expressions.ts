import { StringBuilder } from '@proficient/ds';

import { assertNever } from '../../util/assert.js';
import type {
  Alias,
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
} from './_types.js';

export interface Expression {
  content: string;
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
  const { items } = t;
  const content = items
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
  const commaSeparatedExpressions = t.values.map(vt => expressionForType(vt).content).join(', ');
  return { content: `[${commaSeparatedExpressions}]` };
}

export function expressionForListType(t: List): Expression {
  const expression = expressionForType(t.of);
  return { content: `${expression.content}[]` };
}

export function expressionForRecordType(t: Record): Expression {
  const expression = expressionForType(t.of);
  return { content: `Record<string, ${expression.content}>` };
}

export function expressionForObjectType(t: Object): Expression {
  const { properties } = t;
  const builder = new StringBuilder();

  builder.append(`{\n`);
  properties.forEach(prop => {
    if (prop.docs !== undefined) {
      // TODO: Add docs
    }
    const expression = expressionForType(prop.type);
    builder.append(`${prop.name}${prop.optional ? '?' : ''}: ${expression.content};\n`);
  });
  builder.append(`}`);
  return { content: builder.toString() };
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
