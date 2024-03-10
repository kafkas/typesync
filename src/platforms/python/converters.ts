import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import {
  AliasType,
  BooleanType,
  DatetimeType,
  IntType,
  ListType,
  LiteralType,
  NoneType,
  StringType,
  TupleType,
  Type,
  UnionType,
} from './types';

export interface ExpressibleTupleType extends schema.types.Tuple {
  values: ExpressibleType[];
}

export interface ExpressibleListType extends schema.types.List {
  of: ExpressibleType;
}

export interface ExpressibleUnionType extends schema.types.Union {
  members: ExpressibleType[];
}

export type ExpressibleType =
  | schema.types.Primitive
  | schema.types.Literal
  | ExpressibleTupleType
  | ExpressibleListType
  | ExpressibleUnionType
  | schema.types.Alias;

export interface ExpressibleFieldType extends schema.types.Field {
  type: ExpressibleType;
}

export interface ExpressibleDocumentModel extends schema.DocumentModel {
  fields: ExpressibleFieldType[];
}

interface FlatMapType extends schema.types.Map {
  fields: FlatMapModelFieldType[];
}

export interface FlatMapModelFieldType extends schema.types.Field {
  type: schema.types.Type;
}

export interface ExpressibleAliasModel extends schema.AliasModel {
  value:
    | schema.types.Primitive
    | schema.types.Literal
    | schema.types.Enum
    | ExpressibleTupleType
    | ExpressibleListType
    | FlatMapType
    | ExpressibleUnionType
    | schema.types.Alias;
}

export type ExpressibleModel = ExpressibleDocumentModel | ExpressibleAliasModel;

export interface ExpressibleSchema {
  models: ExpressibleModel[];
}

/*
 * Converters
 */

export function fromPrimitiveType(vt: schema.types.Primitive) {
  switch (vt.type) {
    case 'nil':
      return new NoneType();
    case 'string':
      return new StringType();
    case 'boolean':
      return new BooleanType();
    case 'int':
      return new IntType();
    case 'timestamp':
      return new DatetimeType();
    default:
      assertNever(vt.type);
  }
}

export function fromLiteralType(vt: schema.types.Literal): LiteralType {
  return new LiteralType(vt.value);
}

export function fromExpressibleTupleType(vt: ExpressibleTupleType): TupleType {
  return new TupleType(vt.values.map(fromExpressibleType));
}

export function fromExpressibleListType(vt: ExpressibleListType): ListType {
  return new ListType(fromExpressibleType(vt.of));
}

export function fromExpressibleUnionType(vt: ExpressibleUnionType): UnionType {
  return new UnionType(vt.members.map(fromExpressibleType));
}

export function fromExpressibleAliasType(vt: schema.types.Alias): AliasType {
  return new AliasType(vt.name);
}

export function fromExpressibleType(vt: ExpressibleType): Type {
  if (schema.isPrimitiveType(vt)) {
    return fromPrimitiveType(vt);
  }
  switch (vt.type) {
    case 'literal':
      return fromLiteralType(vt);
    case 'tuple':
      return fromExpressibleTupleType(vt);
    case 'list':
      return fromExpressibleListType(vt);
    case 'union':
      return fromExpressibleUnionType(vt);
    case 'alias':
      return fromExpressibleAliasType(vt);
    default:
      assertNever(vt);
  }
}
