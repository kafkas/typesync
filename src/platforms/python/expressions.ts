import { assertNever } from '../../util/assert';
import { isPrimitiveValueType } from './guards';
import {
  AliasValueType,
  ExpressibleValueType,
  ListValueType,
  LiteralValueType,
  PrimitiveValueType,
  TupleValueType,
  UnionValueType,
} from './types';

export interface Expression {
  content: string;
}

export function forPrimitiveValueType(pyType: PrimitiveValueType): Expression {
  switch (pyType.type) {
    case 'undefined':
      return { content: 'TypeSyncUndefined' };
    case 'none':
      return { content: 'None' };
    case 'string':
      return { content: 'str' };
    case 'bool':
      return { content: 'bool' };
    case 'datetime':
      return { content: 'datetime.datetime' };
    case 'int':
      return { content: 'int' };
    default:
      assertNever(pyType);
  }
}

export function forLiteralValueType(pyType: LiteralValueType): Expression {
  switch (typeof pyType.value) {
    case 'string':
      return { content: `typing.Literal["${pyType.value}"]` };
    case 'number':
      // TODO: Don't allow float literals in the spec
      return { content: `typing.Literal[${pyType.value}]` };
    case 'boolean':
      return { content: `typing.Literal[${pyType.value ? 'True' : 'False'}]` };
    default:
      assertNever(pyType.value);
  }
}

export function forTupleValueType(pyType: TupleValueType): Expression {
  const commaSeparateExpressions = pyType.values
    .map(forExpressibleValueType)
    .map(exp => exp.content)
    .join(', ');
  return { content: `tuple[${commaSeparateExpressions}]` };
}

export function forListValueType(pyType: ListValueType): Expression {
  const expression = forExpressibleValueType(pyType.of);
  return { content: `typing.list[${expression.content}]` };
}

export function forUnionValueType(pyType: UnionValueType): Expression {
  const commaSeparateExpressions = pyType.members
    .map(forExpressibleValueType)
    .map(exp => exp.content)
    .join(', ');
  return { content: `typing.Union[${commaSeparateExpressions}]` };
}

export function forAliasValueType(pyType: AliasValueType): Expression {
  return { content: pyType.name };
}

export function forExpressibleValueType(pyType: ExpressibleValueType): Expression {
  if (isPrimitiveValueType(pyType)) {
    return forPrimitiveValueType(pyType);
  }
  switch (pyType.type) {
    case 'literal':
      return forLiteralValueType(pyType);
    case 'tuple':
      return forTupleValueType(pyType);
    case 'list':
      return forListValueType(pyType);
    case 'union':
      return forUnionValueType(pyType);
    case 'alias':
      return forAliasValueType(pyType);
    default:
      assertNever(pyType);
  }
}
