import { z } from 'zod';

import { assertEmpty } from '../../../util/assert.js';
import { type types } from '../../types/index.js';
import {
  aliasModel,
  aliasType,
  booleanLiteralType,
  booleanType,
  definition,
  discriminatedUnionType,
  documentModel,
  doubleType,
  enumType,
  intEnumType,
  intLiteralType,
  intType,
  listType,
  literalType,
  mapType,
  model,
  nilType,
  objectField,
  objectType,
  primitiveType,
  simpleUnionType,
  stringEnumType,
  stringLiteralType,
  stringType,
  timestampType,
  tupleType,
  type,
  unionType,
  unknownType,
} from '../_zod-schemas.js';
import type { AliasModel, Definition, DocumentModel, Model } from '../impl.js';

type IsExact<T, U> = [Required<T>] extends [Required<U>] ? ([Required<U>] extends [Required<T>] ? true : false) : false;

(() => {
  type DeclaredType = types.Unknown;
  type InferredType = z.infer<typeof unknownType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Nil;
  type InferredType = z.infer<typeof nilType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.String;
  type InferredType = z.infer<typeof stringType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Boolean;
  type InferredType = z.infer<typeof booleanType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Int;
  type InferredType = z.infer<typeof intType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Double;
  type InferredType = z.infer<typeof doubleType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Timestamp;
  type InferredType = z.infer<typeof timestampType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Primitive;
  type InferredType = z.infer<typeof primitiveType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.StringLiteral;
  type InferredType = z.infer<typeof stringLiteralType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.IntLiteral;
  type InferredType = z.infer<typeof intLiteralType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.BooleanLiteral;
  type InferredType = z.infer<typeof booleanLiteralType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Literal;
  type InferredType = z.infer<typeof literalType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.StringEnum;
  type InferredType = z.infer<typeof stringEnumType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.IntEnum;
  type InferredType = z.infer<typeof intEnumType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Enum;
  type InferredType = z.infer<typeof enumType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Tuple;
  type InferredType = z.infer<typeof tupleType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.List;
  type InferredType = z.infer<typeof listType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Map;
  type InferredType = z.infer<typeof mapType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Object;
  type InferredType = z.infer<typeof objectType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.DiscriminatedUnion;
  type InferredType = z.infer<typeof discriminatedUnionType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.SimpleUnion;
  type InferredType = z.infer<typeof simpleUnionType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Union;
  type InferredType = z.infer<typeof unionType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Alias;
  type InferredType = z.infer<typeof aliasType>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.Type;
  type InferredType = z.infer<typeof type>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = types.ObjectField;
  type InferredType = z.infer<typeof objectField>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = AliasModel;
  type InferredType = z.infer<typeof aliasModel>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = DocumentModel;
  type InferredType = z.infer<typeof documentModel>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = Model;
  type InferredType = z.infer<typeof model>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();

(() => {
  type DeclaredType = Definition;
  type InferredType = z.infer<typeof definition>;
  assertEmpty<IsExact<DeclaredType, InferredType>>(true);
})();
