import type {
  Alias,
  DiscriminatedUnion as DiscriminatedUnionGeneric,
  List as ListGeneric,
  Literal,
  Map as MapGeneric,
  ObjectField as ObjectFieldGeneric,
  Object as ObjectGeneric,
  Primitive,
  SimpleUnion as SimpleUnionGeneric,
  Tuple as TupleGeneric,
} from '../generic.js';

export {
  Any,
  Unknown,
  Nil,
  String,
  Boolean,
  Int,
  Double,
  Timestamp,
  Primitive,
  StringLiteral,
  IntLiteral,
  BooleanLiteral,
  Literal,
  StringEnum,
  IntEnum,
  Enum,
  Alias,
} from '../generic.js';
export interface Tuple extends TupleGeneric<Type> {}
export interface List extends ListGeneric<Type> {}
export interface Map extends MapGeneric<Type> {}
export interface ObjectField extends ObjectFieldGeneric<Type> {}
export interface Object extends ObjectGeneric<ObjectField> {}
export interface DiscriminatedUnion extends DiscriminatedUnionGeneric<Alias> {}
export interface SimpleUnion extends SimpleUnionGeneric<Type> {}
export type Union = DiscriminatedUnion | SimpleUnion;
export type Type = Primitive | Literal | Tuple | List | Map | Alias;
