import { assertNever } from '../../util/assert.js';
import type { Alias, Any, Bool, Date, Dictionary, Double, Int, List, Nil, String, Tuple, Type } from './_types.js';

export interface Expression {
  content: string;
}

export function expressionForAnyType(_t: Any): Expression {
  return { content: 'Any' };
}

export function expressionForNilType(_t: Nil): Expression {
  return { content: 'nil' };
}

export function expressionForStringType(_t: String): Expression {
  return { content: 'String' };
}

export function expressionForBoolType(_t: Bool): Expression {
  return { content: 'Bool' };
}

export function expressionForIntType(_t: Int): Expression {
  return { content: 'Int' };
}

export function expressionForDoubleType(_t: Double): Expression {
  return { content: 'Double' };
}

export function expressionForDateType(_t: Date): Expression {
  return { content: 'Date' };
}

export function expressionForTupleType(t: Tuple): Expression {
  const commaSeparatedExpressions = t.elements.map(vt => expressionForType(vt).content).join(', ');
  return { content: `(${commaSeparatedExpressions})` };
}

export function expressionForListType(t: List): Expression {
  const expression = expressionForType(t.elementType);
  return { content: `[${expression.content}]` };
}

export function expressionForDictionaryType(t: Dictionary): Expression {
  const expression = expressionForType(t.valueType);
  return { content: `[String: ${expression.content}]` };
}

export function expressionForAliasType(t: Alias): Expression {
  return { content: t.name };
}

export function expressionForType(t: Type): Expression {
  switch (t.type) {
    case 'any':
      return expressionForAnyType(t);
    case 'nil':
      return expressionForNilType(t);
    case 'string':
      return expressionForStringType(t);
    case 'bool':
      return expressionForBoolType(t);
    case 'int':
      return expressionForIntType(t);
    case 'double':
      return expressionForDoubleType(t);
    case 'date':
      return expressionForDateType(t);
    case 'tuple':
      return expressionForTupleType(t);
    case 'list':
      return expressionForListType(t);
    case 'dictionary':
      return expressionForDictionaryType(t);
    case 'alias':
      return expressionForAliasType(t);
    default:
      assertNever(t);
  }
}
