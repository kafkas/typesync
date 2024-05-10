import { z } from 'zod';

import { assertNever } from '../../util/assert.js';
import { getDuplicateElements } from '../../util/list.js';
import { ordinalSuffixOf } from '../../util/ordinal-suffix.js';
import { type types } from '../types/index.js';
import { type Schema } from './impl.js';

export function createZodSchemasForSchema(schema: Schema) {
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
        return z.NEVER;
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
        return z.NEVER;
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
    .strict()
    .superRefine((candidate, ctx) => {
      const aliasModel = schema.getAliasModel(candidate.name);
      if (aliasModel === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The alias name '${candidate.name}' does not refer to an existing model in this schema.`,
          fatal: true,
        });
        return z.NEVER;
      }
    });

  const discriminatedUnionType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('discriminated-union'),
          discriminant: z.string(),
          variants: z.array(objectType.or(aliasType)),
        })
        .strict()
    )
    .superRefine((candidate, ctx) => {
      if (candidate.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A discriminated union type must have at least one variant.',
          fatal: true,
        });
        return z.NEVER;
      }
      for (let i = 0; i < candidate.variants.length; i++) {
        const variant = candidate.variants[i]!;
        const variantIdx = i;

        if (variant.type === 'object') {
          const { fields } = variant;
          const discriminantField = fields.find(f => f.name === candidate.discriminant);
          if (discriminantField === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `The ${ordinalSuffixOf(variantIdx + 1)} discriminated union variant does not contain a field matching the discriminant '${candidate.discriminant}'.`,
              fatal: true,
            });
            return z.NEVER;
          }
          if (discriminantField.type.type !== 'string-literal' || discriminantField.optional) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `The discriminant field of the ${ordinalSuffixOf(variantIdx + 1)} discriminated union variant must be a non-optional string 'literal' type.`,
              fatal: true,
            });
            return z.NEVER;
          }
        } else if (variant.type === 'alias') {
          const aliasModel = schema.getAliasModel(variant.name);
          if (aliasModel === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `The variant '${variant.name}' does not exist in the schema as a model.`,
              fatal: true,
            });
            return z.NEVER;
          }
          if (aliasModel.type.type !== 'object') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `The variant '${variant.name}' must be an 'object' type.`,
              fatal: true,
            });
            return z.NEVER;
          }
          const { fields } = aliasModel.type;
          const discriminantField = fields.find(f => f.name === candidate.discriminant);
          if (discriminantField === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `The variant '${variant.name}' does not contain a field matching the discriminant '${candidate.discriminant}'.`,
              fatal: true,
            });
            return z.NEVER;
          }
          if (discriminantField.type.type !== 'string-literal' || discriminantField.optional) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `The discriminant field of the variant '${variant.name}' must be a non-optional string 'literal' type.`,
              fatal: true,
            });
            return z.NEVER;
          }
        } else {
          assertNever(variant);
        }
      }
    });

  const simpleUnionType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('simple-union'),
          variants: z.array(type),
        })
        .strict()
    )
    .superRefine((candidate, ctx) => {
      if (candidate.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A simple union type must have at least one variant.',
          fatal: true,
        });
        return z.NEVER;
      }
    });

  const unionType = discriminatedUnionType.or(simpleUnionType);

  const type: z.ZodType<types.Type> = z.union([
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
    discriminatedUnionType,
    simpleUnionType,
    unionType,
    type,
    objectField,
  };
}
