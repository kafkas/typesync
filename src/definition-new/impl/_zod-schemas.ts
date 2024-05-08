import { z } from 'zod';

import type { types } from '../types/index.js';

export const unknownType = z.literal('unknown').describe('An unknown type.');

export const nilType = z.literal('nil').describe('A nil type.');

export const stringType = z.literal('string').describe('A string type.');

export const booleanType = z.literal('boolean').describe('A boolean type.');

export const intType = z.literal('int').describe('An integer type.');

export const doubleType = z.literal('double').describe('A double type.');

export const timestampType = z.literal('timestamp').describe('A timestamp type.');

export const primitiveType = z
  .union([unknownType, nilType, stringType, booleanType, intType, doubleType, timestampType])
  .describe('A primitive type');

export const stringLiteralType = z
  .object({
    type: z.literal('literal'),
    value: z.string().describe('The literal value.'),
  })
  .describe('A string literal type');

export const intLiteralType = z
  .object({
    type: z.literal('literal'),
    value: z.number().int().describe('The literal value.'),
  })
  .describe('An int literal type');

export const booleanLiteralType = z
  .object({
    type: z.literal('literal'),
    value: z.boolean().describe('The literal value.'),
  })
  .describe('A boolean literal type');

export const literalType = stringLiteralType.or(intLiteralType).or(booleanLiteralType).describe('A literal type');

export const stringEnumType = z
  .object({
    type: z.literal('enum'),
    members: z
      .array(
        z
          .object({
            label: z.string().describe('The label for this enumeration item.'),
            value: z.string().describe('The value for this enumeration item.'),
          })
          .strict()
      )
      .describe('A list containing the enumeration members.'),
  })
  .describe('A string enum type');

export const intEnumType = z
  .object({
    type: z.literal('enum'),
    members: z
      .array(
        z
          .object({
            label: z.string().describe('The label for this enumeration item.'),
            value: z.number().int().describe('The value for this enumeration item.'),
          })
          .strict()
      )
      .describe('A list containing the enumeration members.'),
  })
  .describe('An int enum type');

export const enumType = stringEnumType.or(intEnumType).describe('An enum type');

export const tupleType = z
  .lazy(() =>
    z
      .object({
        type: z.literal('tuple'),
        elements: z.array(type).describe('An ordered list of types that comprise this tuple.'),
      })
      .strict()
  )
  .describe('A tuple type');

export const listType = z
  .lazy(() =>
    z
      .object({
        type: z.literal('list'),
        elementType: type.describe('The type representing each element in this list.'),
      })
      .strict()
  )
  .describe('A list type');

export const mapType = z
  .lazy(() =>
    z
      .object({
        type: z.literal('map'),
        valueType: type.describe('The type representing the values in this map. The keys in a map are always strings.'),
      })
      .strict()
  )
  .describe('An arbitrary mapping from strings to any valid types.');

export const objectType = z
  .lazy(() =>
    z
      .object({
        type: z.literal('object'),
        fields: z.record(objectField).describe('The fields that belong to this object.'),
        additionalFields: z
          .boolean()
          .optional()
          .describe(
            'Whether to allow adding arbitrary fields to the object. This currently does not have an effect on Swift output.'
          ),
      })
      .strict()
  )
  .describe('An object type.');

export const discriminatedUnionType = z
  .lazy(() =>
    z
      .object({
        type: z.literal('union'),
        discriminant: z.string().min(1),
        variants: z.array(objectType.or(aliasType)),
      })
      .strict()
  )
  .describe('A discriminated union type.');

export const simpleUnionType = z
  .lazy(() =>
    z
      .object({
        type: z.literal('union'),
        variants: z.array(type),
      })
      .strict()
  )
  .describe('A simple union type.');

export const unionType = discriminatedUnionType.or(simpleUnionType).describe('A union type.');

export const aliasType = z.string().describe('An alias type.');

export const type: z.ZodType<types.Type> = primitiveType
  .or(literalType)
  .or(enumType)
  .or(tupleType)
  .or(listType)
  .or(mapType)
  .or(objectType)
  .or(unionType)
  .or(aliasType)
  .describe('Any valid type.');

export const objectField: z.ZodType<types.ObjectField> = z
  .object({
    type: type,
    optional: z.boolean().optional().describe('Whether this field is optional. Defaults to false.'),
    docs: z.string().optional().describe('Optional documentation for the object field.'),
  })
  .strict()
  .describe('An object field.');

export const aliasModel = z
  .object({
    model: z.literal('alias').describe(`A literal field indicating that this is an 'alias' model.`),
    docs: z.string().optional().describe('Optional documentation for the model.'),
    type: type.describe(`The type that this model is an alias of.`),
  })
  .strict()
  .describe('An alias model');

export const documentModel = z
  .object({
    model: z.literal('document').describe(`A literal field indicating that this is a 'document' model.`),
    docs: z.string().optional().describe('Optional documentation for the model.'),
    type: objectType.describe(`The type that represents the shape of the document model. Must be an 'object' type.`),
  })
  .strict()
  .describe('A document model.');

export const model = z.discriminatedUnion('model', [aliasModel, documentModel]);

export const definition = z.record(model);
