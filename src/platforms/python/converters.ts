import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import {
  AliasValueType,
  BooleanValueType,
  DatetimeValueType,
  IntValueType,
  ListValueType,
  LiteralValueType,
  NoneValueType,
  StringValueType,
  TupleValueType,
  UnionValueType,
  ValueType,
} from './types';

export interface ExpressibleTupleValueType extends schema.types.Tuple {
  values: ExpressibleValueType[];
}

export interface ExpressibleListValueType extends schema.types.List {
  of: ExpressibleValueType;
}

export interface ExpressibleUnionValueType extends schema.types.Union {
  members: ExpressibleValueType[];
}

export type ExpressibleValueType =
  | schema.types.Primitive
  | schema.types.Literal
  | ExpressibleTupleValueType
  | ExpressibleListValueType
  | ExpressibleUnionValueType
  | schema.types.Alias;

export interface ExpressibleModelField extends schema.types.Field {
  type: ExpressibleValueType;
}

export interface ExpressibleDocumentModel extends schema.DocumentModel {
  fields: ExpressibleModelField[];
}

export interface FlatMapValueType extends schema.types.Map {
  fields: FlatMapModelFieldValueType[];
}

export interface FlatMapModelFieldValueType extends schema.types.Field {
  type: schema.types.Type;
}

export interface ExpressibleAliasModel extends schema.AliasModel {
  value:
    | schema.types.Primitive
    | schema.types.Literal
    | schema.types.Enum
    | ExpressibleTupleValueType
    | ExpressibleListValueType
    | FlatMapValueType
    | ExpressibleUnionValueType
    | schema.types.Alias;
}

export type ExpressibleModel = ExpressibleDocumentModel | ExpressibleAliasModel;

export interface ExpressibleSchema {
  models: ExpressibleModel[];
}

/*
 * Converters
 */

export function fromPrimitiveValueType(vt: schema.types.Primitive) {
  switch (vt.type) {
    case 'nil':
      return new NoneValueType();
    case 'string':
      return new StringValueType();
    case 'boolean':
      return new BooleanValueType();
    case 'int':
      return new IntValueType();
    case 'timestamp':
      return new DatetimeValueType();
    default:
      assertNever(vt.type);
  }
}

export function fromLiteralValueType(vt: schema.types.Literal): LiteralValueType {
  return new LiteralValueType(vt.value);
}

export function fromExpressibleTupleValueType(vt: ExpressibleTupleValueType): TupleValueType {
  return new TupleValueType(vt.values.map(fromExpressibleValueType));
}

export function fromExpressibleListValueType(vt: ExpressibleListValueType): ListValueType {
  return new ListValueType(fromExpressibleValueType(vt.of));
}

export function fromExpressibleUnionValueType(vt: ExpressibleUnionValueType): UnionValueType {
  return new UnionValueType(vt.members.map(fromExpressibleValueType));
}

export function fromExpressibleAliasValueType(vt: schema.types.Alias): AliasValueType {
  return new AliasValueType(vt.name);
}

export function fromExpressibleValueType(vt: ExpressibleValueType): ValueType {
  if (schema.isPrimitiveValueType(vt)) {
    return fromPrimitiveValueType(vt);
  }
  switch (vt.type) {
    case 'literal':
      return fromLiteralValueType(vt);
    case 'tuple':
      return fromExpressibleTupleValueType(vt);
    case 'list':
      return fromExpressibleListValueType(vt);
    case 'union':
      return fromExpressibleUnionValueType(vt);
    case 'alias':
      return fromExpressibleAliasValueType(vt);
    default:
      assertNever(vt);
  }
}
