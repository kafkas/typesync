import { z } from 'zod';

import { assertEmpty } from '../../util/assert.js';
import { types } from '../types/index.js';
import {
  aliasType,
  booleanLiteralType,
  booleanType,
  discriminantUnionAliasVariantType,
  discriminantUnionObjectVariantType,
  discriminantUnionVariantType,
  discriminatedUnionType,
  doubleType,
  enumType,
  intEnumMemberType,
  intEnumType,
  intLiteralType,
  intType,
  listType,
  literalType,
  mapType,
  nilType,
  objectField,
  objectType,
  primitiveType,
  simpleUnionType,
  stringEnumMemberType,
  stringEnumType,
  stringLiteralType,
  stringType,
  timestampType,
  tupleType,
  type,
  unionType,
  unknownType,
} from '../types/zod-schemas.js';

type IsExact<T, U> = [Required<T>] extends [Required<U>] ? ([Required<U>] extends [Required<T>] ? true : false) : false;

describe('type declarations are consistent with zod schemas', () => {
  it('Unknown', () => {
    type DeclaredType = types.Unknown;
    type InferredType = z.infer<typeof unknownType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Nil', () => {
    type DeclaredType = types.Nil;
    type InferredType = z.infer<typeof nilType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('String', () => {
    type DeclaredType = types.String;
    type InferredType = z.infer<typeof stringType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Boolean', () => {
    type DeclaredType = types.Boolean;
    type InferredType = z.infer<typeof booleanType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Int', () => {
    type DeclaredType = types.Int;
    type InferredType = z.infer<typeof intType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Double', () => {
    type DeclaredType = types.Double;
    type InferredType = z.infer<typeof doubleType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Timestamp', () => {
    type DeclaredType = types.Timestamp;
    type InferredType = z.infer<typeof timestampType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Primitive', () => {
    type DeclaredType = types.Primitive;
    type InferredType = z.infer<typeof primitiveType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('StringLiteral', () => {
    type DeclaredType = types.StringLiteral;
    type InferredType = z.infer<typeof stringLiteralType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('IntLiteral', () => {
    type DeclaredType = types.IntLiteral;
    type InferredType = z.infer<typeof intLiteralType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('BooleanLiteral', () => {
    type DeclaredType = types.BooleanLiteral;
    type InferredType = z.infer<typeof booleanLiteralType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Literal', () => {
    type DeclaredType = types.Literal;
    type InferredType = z.infer<typeof literalType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('StringEnumMember', () => {
    type DeclaredType = types.StringEnumMember;
    type InferredType = z.infer<typeof stringEnumMemberType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('StringEnum', () => {
    type DeclaredType = types.StringEnum;
    type InferredType = z.infer<typeof stringEnumType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('IntEnumMember', () => {
    type DeclaredType = types.IntEnumMember;
    type InferredType = z.infer<typeof intEnumMemberType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('IntEnum', () => {
    type DeclaredType = types.IntEnum;
    type InferredType = z.infer<typeof intEnumType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Enum', () => {
    type DeclaredType = types.Enum;
    type InferredType = z.infer<typeof enumType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Tuple', () => {
    type DeclaredType = types.Tuple;
    type InferredType = z.infer<typeof tupleType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('List', () => {
    type DeclaredType = types.List;
    type InferredType = z.infer<typeof listType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Map', () => {
    type DeclaredType = types.Map;
    type InferredType = z.infer<typeof mapType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Object', () => {
    type DeclaredType = types.Object;
    type InferredType = z.infer<typeof objectType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Alias', () => {
    type DeclaredType = types.Alias;
    type InferredType = z.infer<typeof aliasType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('DiscriminatedUnionObjectVariant', () => {
    type DeclaredType = types.DiscriminatedUnionObjectVariant;
    type InferredType = z.infer<typeof discriminantUnionObjectVariantType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('DiscriminatedUnionAliasVariant', () => {
    type DeclaredType = types.DiscriminatedUnionAliasVariant;
    type InferredType = z.infer<typeof discriminantUnionAliasVariantType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('DiscriminatedUnionVariant', () => {
    type DeclaredType = types.DiscriminatedUnionVariant;
    type InferredType = z.infer<typeof discriminantUnionVariantType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('DiscriminatedUnion', () => {
    type DeclaredType = types.DiscriminatedUnion;
    type InferredType = z.infer<typeof discriminatedUnionType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('SimpleUnion', () => {
    type DeclaredType = types.SimpleUnion;
    type InferredType = z.infer<typeof simpleUnionType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Union', () => {
    type DeclaredType = types.Union;
    type InferredType = z.infer<typeof unionType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('Type', () => {
    type DeclaredType = types.Type;
    type InferredType = z.infer<typeof type>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });

  it('ObjectField', () => {
    type DeclaredType = types.ObjectField;
    type InferredType = z.infer<typeof objectField>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });
});
