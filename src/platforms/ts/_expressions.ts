import { StringBuilder } from '@proficient/ds';

import { assertNever } from '../../util/assert';
import { isPrimitiveType } from './_guards';
import type { Alias, Enum, List, Literal, Object, Primitive, Tuple, Type, Union } from './_types';

export interface Expression {
  content: string;
}

export function expressionForPrimitiveType(t: Primitive): Expression {
  switch (t.type) {
    case 'null':
      return { content: 'null' };
    case 'string':
      return { content: 'string' };
    case 'boolean':
      return { content: 'boolean' };
    case 'number':
      return { content: 'number' };
    case 'timestamp':
      return { content: 'firestore.Timestamp' };
    default:
      assertNever(t);
  }
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

export function expressionForObjectType(t: Object): Expression {
  const { fields } = t;
  const builder = new StringBuilder();

  builder.append(`{\n`);
  fields.forEach(field => {
    if (field.docs !== undefined) {
      // TODO: Add docs
    }
    const expression = expressionForType(field.type);
    builder.append(`${field.name}${field.optional ? '?' : ''}: ${expression.content};\n`);
  });
  builder.append(`}`);
  return { content: builder.toString() };
}

export function expressionForUnionType(t: Union): Expression {
  const separatedExpressions = t.members.map(expressionForType).join(' | ');
  return { content: `${separatedExpressions}` };
}

export function expressionForAliasType(t: Alias): Expression {
  return { content: t.name };
}

export function expressionForType(t: Type): Expression {
  if (isPrimitiveType(t)) {
    return expressionForPrimitiveType(t);
  }
  switch (t.type) {
    case 'literal':
      return expressionForLiteralType(t);
    case 'enum':
      return expressionForEnumType(t);
    case 'tuple':
      return expressionForTupleType(t);
    case 'list':
      return expressionForListType(t);
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
