import { z } from 'zod';

import { getDuplicateElements } from '../../util/list.js';
import { type Schema } from '../impl.js';
import { type Type } from './_types.js';

export function schemaParsers(schema: Schema) {
  const unknownType = z
    .object({
      type: z.literal('unknown'),
    })
    .strict();

  const nilType = z
    .object({
      type: z.literal('nil'),
    })
    .strict();

  const stringType = z
    .object({
      type: z.literal('string'),
    })
    .strict();

  const booleanType = z
    .object({
      type: z.literal('boolean'),
    })
    .strict();

  const intType = z
    .object({
      type: z.literal('int'),
    })
    .strict();

  const doubleType = z
    .object({
      type: z.literal('double'),
    })
    .strict();

  const timestampType = z
    .object({
      type: z.literal('timestamp'),
    })
    .strict();

  const primitiveType = unknownType
    .or(nilType)
    .or(stringType)
    .or(booleanType)
    .or(intType)
    .or(doubleType)
    .or(timestampType);

  const stringLiteralType = z
    .object({
      type: z.literal('string-literal'),
      value: z.string(),
    })
    .strict();

  const intLiteralType = z
    .object({
      type: z.literal('int-literal'),
      value: z.number().int(),
    })
    .strict();

  const booleanLiteralType = z
    .object({
      type: z.literal('boolean-literal'),
      value: z.boolean(),
    })
    .strict();

  const literalType = stringLiteralType.or(intLiteralType).or(booleanLiteralType);

  const stringEnumMemberType = z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .strict();

  const stringEnumType = z
    .object({
      type: z.literal('string-enum'),
      members: z.array(stringEnumMemberType),
    })
    .strict()
    .superRefine((candidate, ctx) => {
      if (candidate.members.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'An enum type must have at least one member.',
          fatal: true,
        });
        return z.NEVER;
      }
      const labels = candidate.members.map(member => member.label);
      const values = candidate.members.map(member => member.value);
      const [duplicateLabel] = getDuplicateElements(labels);
      const [duplicateValue] = getDuplicateElements(values);
      if (duplicateLabel !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The enum member label "${duplicateLabel}" has been used more than once. Each enum member must have a distinct label.`,
          fatal: true,
        });
        return z.NEVER;
      }
      if (duplicateValue !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The enum member value "${duplicateValue}" has been used more than once. Each enum member must have a distinct value.`,
          fatal: true,
        });
      }
    });

  const intEnumMemberType = z
    .object({
      label: z.string(),
      value: z.number().int(),
    })
    .strict();

  const intEnumType = z
    .object({
      type: z.literal('int-enum'),
      members: z.array(intEnumMemberType),
    })
    .strict()
    .superRefine((candidate, ctx) => {
      if (candidate.members.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'An enum type must have at least one member.',
          fatal: true,
        });
        return z.NEVER;
      }
      const labels = candidate.members.map(member => member.label);
      const values = candidate.members.map(member => member.value);
      const [duplicateLabel] = getDuplicateElements(labels);
      const [duplicateValue] = getDuplicateElements(values);
      if (duplicateLabel !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The enum member label "${duplicateLabel}" has been used more than once. Each enum member must have a distinct label.`,
          fatal: true,
        });
        return z.NEVER;
      }
      if (duplicateValue !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The enum member value ${duplicateValue} has been used more than once. Each enum member must have a distinct value.`,
          fatal: true,
        });
      }
    });

  const enumType = stringEnumType.or(intEnumType);

  const tupleType = z.lazy(() =>
    z
      .object({
        type: z.literal('tuple'),
        elements: z.array(type),
      })
      .strict()
  );

  const listType = z.lazy(() =>
    z
      .object({
        type: z.literal('list'),
        elementType: type,
      })
      .strict()
  );

  const mapType = z.lazy(() =>
    z
      .object({
        type: z.literal('map'),
        valueType: type,
      })
      .strict()
  );

  const objectType = z.lazy(() =>
    z
      .object({
        type: z.literal('object'),
        fields: z.array(objectField),
        additionalFields: z.boolean(),
      })
      .strict()
  );

  const aliasType = z
    .object({
      type: z.literal('alias'),
      name: z.string(),
    })
    .strict();

  const discriminantUnionObjectVariantType = z
    .object({
      type: z.literal('object-variant'),
      objectType,
      discriminantType: stringLiteralType,
    })
    .strict();

  const discriminantUnionAliasVariantType = z
    .object({
      type: z.literal('alias-variant'),
      aliasType,
      originalObjectType: objectType,
      discriminantType: stringLiteralType,
    })
    .strict();

  const discriminantUnionVariantType = z.discriminatedUnion('type', [
    discriminantUnionObjectVariantType,
    discriminantUnionAliasVariantType,
  ]);

  const discriminatedUnionType = z.lazy(() =>
    z
      .object({
        type: z.literal('discriminated-union'),
        discriminant: z.string(),
        variants: z.array(discriminantUnionVariantType),
      })
      .strict()
  );

  const simpleUnionType = z.lazy(() =>
    z
      .object({
        type: z.literal('simple-union'),
        variants: z.array(type),
      })
      .strict()
  );

  const unionType = discriminatedUnionType.or(simpleUnionType);

  const type: z.ZodType<Type> = z.union([
    primitiveType,
    literalType,
    enumType,
    tupleType,
    listType,
    mapType,
    objectType,
    unionType,
    aliasType,
  ]);

  const objectField = z
    .object({
      type,
      optional: z.boolean(),
      name: z.string(),
      docs: z.string().nullable(),
    })
    .strict();

  return {
    unknownType,
    nilType,
    stringType,
    booleanType,
    intType,
    doubleType,
    timestampType,
    primitiveType,
    stringLiteralType,
    intLiteralType,
    booleanLiteralType,
    literalType,
    stringEnumMemberType,
    stringEnumType,
    intEnumMemberType,
    intEnumType,
    enumType,
    tupleType,
    listType,
    mapType,
    objectType,
    aliasType,
    discriminantUnionObjectVariantType,
    discriminantUnionAliasVariantType,
    discriminantUnionVariantType,
    discriminatedUnionType,
    simpleUnionType,
    unionType,
    type,
    objectField,
  };
}
