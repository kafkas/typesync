import { PYTHON_UNDEFINED_SENTINEL_CLASS } from '../../constants.js';
import { assertNever } from '../../util/assert.js';
import type {
  Alias,
  Any,
  Bool,
  Datetime,
  Dict,
  DiscriminatedUnion,
  Float,
  Int,
  List,
  Literal,
  None,
  SimpleUnion,
  Str,
  Tuple,
  Type,
  Undefined,
} from './_types.js';

export interface Expression {
  content: string;
}

export function expressionForUndefinedType(_t: Undefined): Expression {
  return { content: PYTHON_UNDEFINED_SENTINEL_CLASS };
}

export function expressionForAnyType(_t: Any): Expression {
  return { content: 'typing.Any' };
}

export function expressionForNoneType(_t: None): Expression {
  return { content: 'None' };
}

export function expressionForStrType(_t: Str): Expression {
  return { content: 'str' };
}

export function expressionForBoolType(_t: Bool): Expression {
  return { content: 'bool' };
}

export function expressionForIntType(_t: Int): Expression {
  return { content: 'int' };
}

export function expressionForFloatType(_t: Float): Expression {
  return { content: 'float' };
}

export function expressionForDatetimeType(_t: Datetime): Expression {
  return { content: 'datetime.datetime' };
}

export function expressionForLiteralType(t: Literal): Expression {
  switch (typeof t.value) {
    case 'string':
      return { content: `typing.Literal["${t.value}"]` };
    case 'number':
      return { content: `typing.Literal[${t.value}]` };
    case 'boolean':
      return { content: `typing.Literal[${t.value ? 'True' : 'False'}]` };
    default:
      assertNever(t.value);
  }
}

export function expressionForTupleType(t: Tuple): Expression {
  const commaSeparatedExpressions = t.elements.map(vt => expressionForType(vt).content).join(', ');
  return { content: `tuple[${commaSeparatedExpressions}]` };
}

export function expressionForListType(t: List): Expression {
  const expression = expressionForType(t.elementType);
  return { content: `typing.List[${expression.content}]` };
}

export function expressionForDictType(t: Dict): Expression {
  const expression = expressionForType(t.valueType);
  return { content: `typing.Dict[str, ${expression.content}]` };
}

export function expressionForDiscriminatedUnionType(t: DiscriminatedUnion): Expression {
  const commaSeparatedExpressions = t.variants.map(vt => expressionForType(vt).content).join(', ');
  return {
    content: `Annotated[typing.Union[${commaSeparatedExpressions}], pydantic.Field(discriminator='${t.discriminant}')]`,
  };
}

export function expressionForSimpleUnionType(t: SimpleUnion): Expression {
  const commaSeparatedExpressions = t.variants.map(vt => expressionForType(vt).content).join(', ');
  return { content: `typing.Union[${commaSeparatedExpressions}]` };
}

export function expressionForAliasType(t: Alias): Expression {
  return { content: t.name };
}

export function expressionForType(t: Type): Expression {
  switch (t.type) {
    case 'undefined':
      return expressionForUndefinedType(t);
    case 'any':
      return expressionForAnyType(t);
    case 'none':
      return expressionForNoneType(t);
    case 'str':
      return expressionForStrType(t);
    case 'bool':
      return expressionForBoolType(t);
    case 'int':
      return expressionForIntType(t);
    case 'float':
      return expressionForFloatType(t);
    case 'datetime':
      return expressionForDatetimeType(t);
    case 'literal':
      return expressionForLiteralType(t);
    case 'tuple':
      return expressionForTupleType(t);
    case 'list':
      return expressionForListType(t);
    case 'dict':
      return expressionForDictType(t);
    case 'discriminated-union':
      return expressionForDiscriminatedUnionType(t);
    case 'simple-union':
      return expressionForSimpleUnionType(t);
    case 'alias':
      return expressionForAliasType(t);
    default:
      assertNever(t);
  }
}
