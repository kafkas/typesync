import { z } from 'zod';

import { getDuplicateElements } from '../../util/list.js';
import { type Type } from './_types.js';

export const unknownType = z
  .object({
    type: z.literal('unknown'),
  })
  .strict();

export const nilType = z
  .object({
    type: z.literal('nil'),
  })
  .strict();

export const stringType = z
  .object({
    type: z.literal('string'),
  })
  .strict();

export const booleanType = z
  .object({
    type: z.literal('boolean'),
  })
  .strict();

export const intType = z
  .object({
    type: z.literal('int'),
  })
  .strict();

export const doubleType = z
  .object({
    type: z.literal('double'),
  })
  .strict();

export const timestampType = z
  .object({
    type: z.literal('timestamp'),
  })
  .strict();

export const primitiveType = unknownType
  .or(nilType)
  .or(stringType)
  .or(booleanType)
  .or(intType)
  .or(doubleType)
  .or(timestampType);

export const stringLiteralType = z
  .object({
    type: z.literal('string-literal'),
    value: z.string(),
  })
  .strict();

export const intLiteralType = z
  .object({
    type: z.literal('int-literal'),
    value: z.number().int(),
  })
  .strict();

export const booleanLiteralType = z
  .object({
    type: z.literal('boolean-literal'),
    value: z.boolean(),
  })
  .strict();

export const literalType = stringLiteralType.or(intLiteralType).or(booleanLiteralType);

export const stringEnumMemberType = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .strict();

export const stringEnumType = z
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

export const intEnumMemberType = z
  .object({
    label: z.string(),
    value: z.number().int(),
  })
  .strict();

export const intEnumType = z
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

export const enumType = stringEnumType.or(intEnumType);

export const tupleType = z.lazy(() =>
  z
    .object({
      type: z.literal('tuple'),
      elements: z.array(type),
    })
    .strict()
);

export const listType = z.lazy(() =>
  z
    .object({
      type: z.literal('list'),
      elementType: type,
    })
    .strict()
);

export const mapType = z.lazy(() =>
  z
    .object({
      type: z.literal('map'),
      valueType: type,
    })
    .strict()
);

export const objectType = z.lazy(() =>
  z
    .object({
      type: z.literal('object'),
      fields: z.array(objectField),
      additionalFields: z.boolean(),
    })
    .strict()
);

export const aliasType = z
  .object({
    type: z.literal('alias'),
    name: z.string(),
  })
  .strict();

export const discriminantUnionObjectVariantType = z
  .object({
    type: z.literal('object-variant'),
    objectType,
    discriminantType: stringLiteralType,
  })
  .strict();

export const discriminantUnionAliasVariantType = z
  .object({
    type: z.literal('alias-variant'),
    aliasType,
    originalObjectType: objectType,
    discriminantType: stringLiteralType,
  })
  .strict();

export const discriminantUnionVariantType = z.discriminatedUnion('type', [
  discriminantUnionObjectVariantType,
  discriminantUnionAliasVariantType,
]);

export const discriminatedUnionType = z.lazy(() =>
  z
    .object({
      type: z.literal('discriminated-union'),
      discriminant: z.string(),
      variants: z.array(discriminantUnionVariantType),
    })
    .strict()
);

export const simpleUnionType = z.lazy(() =>
  z
    .object({
      type: z.literal('simple-union'),
      variants: z.array(type),
    })
    .strict()
);

export const unionType = discriminatedUnionType.or(simpleUnionType);

// TODO: This should be a discriminated union
export const type: z.ZodType<Type> = primitiveType
  .or(literalType)
  .or(enumType)
  .or(tupleType)
  .or(listType)
  .or(mapType)
  .or(objectType)
  .or(unionType)
  .or(aliasType);

export const objectField = z
  .object({
    type,
    optional: z.boolean(),
    name: z.string(),
    docs: z.string().nullable(),
  })
  .strict();
