import { assertNever } from '../../util/assert';
import { isPrimitiveValueType } from './guards';
import {
  AliasValueType,
  ListValueType,
  LiteralValueType,
  PrimitiveValueType,
  TupleValueType,
  UnionValueType,
  ValueType,
} from './types';

export interface Expression {
  content: string;
}

export function fromPrimitiveValueType(pyType: PrimitiveValueType): Expression {
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

export function fromLiteralValueType(pyType: LiteralValueType): Expression {
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

export function fromTupleValueType(pyType: TupleValueType): Expression {
  const commaSeparateExpressions = pyType.values
    .map(fromValueType)
    .map(exp => exp.content)
    .join(', ');
  return { content: `tuple[${commaSeparateExpressions}]` };
}

export function fromListValueType(pyType: ListValueType): Expression {
  const expression = fromValueType(pyType.of);
  return { content: `typing.list[${expression.content}]` };
}

export function fromUnionValueType(pyType: UnionValueType): Expression {
  const commaSeparateExpressions = pyType.members
    .map(fromValueType)
    .map(exp => exp.content)
    .join(', ');
  return { content: `typing.Union[${commaSeparateExpressions}]` };
}

export function fromAliasValueType(pyType: AliasValueType): Expression {
  return { content: pyType.name };
}

export function fromValueType(pyType: ValueType): Expression {
  if (isPrimitiveValueType(pyType)) {
    return fromPrimitiveValueType(pyType);
  }
  switch (pyType.type) {
    case 'literal':
      return fromLiteralValueType(pyType);
    case 'tuple':
      return fromTupleValueType(pyType);
    case 'list':
      return fromListValueType(pyType);
    case 'union':
      return fromUnionValueType(pyType);
    case 'alias':
      return fromAliasValueType(pyType);
    default:
      assertNever(pyType);
  }
}
