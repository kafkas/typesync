import { z } from 'zod';

import type { types } from './types/index.js';

const createDefinition = (aliasType: z.ZodType) => {
  const primitiveType = z.enum(['nil', 'string', 'boolean', 'int', 'double', 'timestamp']).describe('A primitive type');

  const literalType = z
    .object({
      type: z.literal('literal'),
      value: z.string().or(z.number().int()).or(z.boolean()),
    })
    .describe('A literal type');

  const enumType = z
    .object({
      type: z.literal('enum'),
      items: z.array(
        z
          .object({
            label: z.string(),
            value: z.string().or(z.number()),
          })
          .strict()
      ),
    })
    .describe('An enum type');

  const tupleType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('tuple'),
          values: z.array(type),
        })
        .strict()
    )
    .describe('A tuple type');

  const listType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('list'),
          of: type,
        })
        .strict()
    )
    .describe('A list type');

  const mapType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('map'),
          of: type,
        })
        .strict()
    )
    .describe('A map type');

  const objectType = z
    .lazy(() =>
      z
        .object({
          type: z.literal('object'),
          fields: z.record(field),
        })
        .strict()
    )
    .describe('An object type');

  const unionType = z.lazy(() => z.array(type)).describe('A union type');

  const type: z.ZodType<types.Type> = primitiveType
    .or(literalType)
    .or(enumType)
    .or(tupleType)
    .or(listType)
    .or(mapType)
    .or(objectType)
    .or(unionType)
    .or(aliasType)
    .describe('Any valid type');

  const field: z.ZodType<types.ObjectField> = z
    .object({
      type: type,
      optional: z.boolean().optional(),
      docs: z.string().optional(),
    })
    .strict()
    .describe('An object field');

  const aliasModel = z
    .object({
      model: z.literal('alias'),
      docs: z.string().optional(),
      type: type,
    })
    .strict()
    .describe('An alias model');

  const documentModel = z
    .object({
      model: z.literal('document'),
      docs: z.string().optional(),
      type: objectType,
    })
    .strict()
    .describe('A document model');

  const model = z.discriminatedUnion('model', [aliasModel, documentModel]);

  return z.record(model);
};

export const definition = (() => {
  const aliasType = z.string().describe('An alias type');
  return createDefinition(aliasType);
})();

export const definitionWithKnownAliases = (aliasNames: string[]) => {
  const aliasType = z.enum([...aliasNames] as [string, ...string[]]).describe('An alias type');
  return createDefinition(aliasType);
};
