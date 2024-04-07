import { z } from 'zod';

import type { types } from './types/index.js';

const createDefinition = (aliasType: z.ZodType) => {
  const primitiveType = z.enum(['nil', 'string', 'boolean', 'int', 'double', 'timestamp']).describe('A primitive type');

  const literalType = z
    .object({
      type: z.literal('literal'),
      value: z.string().or(z.number().int()).or(z.boolean()).describe('The literal value.'),
    })
    .describe('A literal type');

  const enumType = z
    .object({
      type: z.literal('enum'),
      items: z
        .array(
          z
            .object({
              label: z.string().describe('The label for this enumeration item.'),
              value: z.string().or(z.number()).describe('The value for this enumeration item.'),
            })
            .strict()
        )
        .describe('A list containing the enumeration items.'),
    })
    .describe('An enum type');

  const tupleType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('tuple'),
          values: z.array(type).describe('An ordered list of types that comprise this tuple.'),
        })
        .strict()
    )
    .describe('A tuple type');

  const listType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('list'),
          of: type.describe('The type representing each element in this list.'),
        })
        .strict()
    )
    .describe('A list type');

  const mapType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('map'),
          of: type.describe('The type representing the values in this map. The keys in a map are always strings.'),
        })
        .strict()
    )
    .describe('An arbitrary mapping from strings to any valid types.');

  const objectType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('object'),
          fields: z.record(field).describe('The fields that belong to this object.'),
        })
        .strict()
    )
    .describe('An object type.');

  const unionType = z.lazy(() => z.array(type)).describe('A union type.');

  const type: z.ZodType<types.Type> = primitiveType
    .or(literalType)
    .or(enumType)
    .or(tupleType)
    .or(listType)
    .or(mapType)
    .or(objectType)
    .or(unionType)
    .or(aliasType)
    .describe('Any valid type.');

  const field: z.ZodType<types.ObjectField> = z
    .object({
      type: type,
      optional: z.boolean().optional().describe('Whether this field is optional. Defaults to false.'),
      docs: z.string().optional().describe('Optional documentation for the object field.'),
    })
    .strict()
    .describe('An object field.');

  const aliasModel = z
    .object({
      model: z.literal('alias').describe(`A literal field indicating that this is an 'alias' model.`),
      docs: z.string().optional().describe('Optional documentation for the model.'),
      type: type.describe(`The type that this model is an alias of.`),
    })
    .strict()
    .describe('An alias model');

  const documentModel = z
    .object({
      model: z.literal('document').describe(`A literal field indicating that this is a 'document' model.`),
      docs: z.string().optional().describe('Optional documentation for the model.'),
      type: objectType.describe(
        `The type that represents the shape of the document model. Can be one of 'object' or 'map'.`
      ),
    })
    .strict()
    .describe('A document model.');

  const model = z.discriminatedUnion('model', [aliasModel, documentModel]);

  return z.record(model);
};

export const definition = (() => {
  const aliasType = z.string().describe('An alias type.');
  return createDefinition(aliasType);
})();

export const definitionWithKnownAliases = (aliasNames: string[]) => {
  const aliasType = z.enum([...aliasNames] as [string, ...string[]]).describe('An alias type');
  return createDefinition(aliasType);
};
