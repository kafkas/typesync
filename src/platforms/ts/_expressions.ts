import { StringBuilder } from '@proficient/ds';

import type { TSGenerationTarget } from '../../api/index.js';
import { assertNever } from '../../util/assert.js';
import type {
  Alias,
  Any,
  Boolean,
  Bytes,
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

/**
 * Per-call context threaded through `expressionForType` and friends.
 *
 * The TypeScript output of a few primitive types depends on which Firebase
 * SDK the caller is generating against (e.g. `bytes` becomes `Buffer` for
 * the admin SDK, `firestore.Bytes` for the web SDK, and `firestore.Blob`
 * for the React Native SDK), so each expression-emitter takes the active
 * generation target rather than guessing a default.
 */
export interface ExpressionOptions {
  target: TSGenerationTarget;
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

export function expressionForBytesType(_t: Bytes, options: ExpressionOptions): Expression {
  switch (options.target) {
    case 'firebase-admin@13':
    case 'firebase-admin@12':
    case 'firebase-admin@11':
    case 'firebase-admin@10':
      return { content: 'Buffer' };
    case 'firebase@11':
    case 'firebase@10':
    case 'firebase@9':
      return { content: 'firestore.Bytes' };
    case 'react-native-firebase@21':
    case 'react-native-firebase@20':
    case 'react-native-firebase@19':
      return { content: 'firestore.Blob' };
    default:
      assertNever(options.target);
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

export function expressionForTupleType(t: Tuple, options: ExpressionOptions): Expression {
  const commaSeparatedExpressions = t.elements.map(vt => expressionForType(vt, options).content).join(', ');
  return { content: `[${commaSeparatedExpressions}]` };
}

export function expressionForListType(t: List, options: ExpressionOptions): Expression {
  const expression = expressionForType(t.elementType, options);
  return { content: `${expression.content}[]` };
}

export function expressionForRecordType(t: Record, options: ExpressionOptions): Expression {
  const expression = expressionForType(t.valueType, options);
  return { content: `Record<string, ${expression.content}>` };
}

export function expressionForObjectType(t: Object, options: ExpressionOptions): Expression {
  const { properties, additionalProperties } = t;
  const b = new StringBuilder();

  b.append(`{\n`);
  properties.forEach(prop => {
    if (prop.docs !== null) {
      b.append(`/** ${prop.docs} */\n`);
    }
    const expression = expressionForType(prop.type, options);
    b.append(`${prop.name}${prop.optional ? '?' : ''}: ${expression.content};\n`);
  });
  if (additionalProperties) {
    b.append('[K: string]: unknown;\n');
  }
  b.append(`}`);
  return { content: b.toString() };
}

export function expressionForUnionType(t: Union, options: ExpressionOptions): Expression {
  const separatedExpressions = t.variants.map(vt => expressionForType(vt, options).content).join(' | ');
  return { content: `${separatedExpressions}` };
}

export function expressionForAliasType(t: Alias): Expression {
  return { content: t.name };
}

export function expressionForType(t: Type, options: ExpressionOptions): Expression {
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
    case 'bytes':
      return expressionForBytesType(t, options);
    case 'literal':
      return expressionForLiteralType(t);
    case 'enum':
      return expressionForEnumType(t);
    case 'tuple':
      return expressionForTupleType(t, options);
    case 'list':
      return expressionForListType(t, options);
    case 'record':
      return expressionForRecordType(t, options);
    case 'object':
      return expressionForObjectType(t, options);
    case 'union':
      return expressionForUnionType(t, options);
    case 'alias':
      return expressionForAliasType(t);
    default:
      assertNever(t);
  }
}
