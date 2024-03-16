import { z } from 'zod';

import type { types } from './types';

export const primitiveType = z.enum(['nil', 'string', 'boolean', 'int', 'timestamp']);

export const literalType = z.object({
  type: z.literal('literal'),
  value: z.string().or(z.number()).or(z.boolean()),
});

export const enumType = z.object({
  type: z.literal('enum'),
  items: z.array(
    z
      .object({
        label: z.string(),
        value: z.string().or(z.number()),
      })
      .strict()
  ),
});

export const tupleType = (aliasNames: string[]) =>
  z.lazy(() =>
    z
      .object({
        type: z.literal('tuple'),
        values: z.array(type(aliasNames)),
      })
      .strict()
  );

export const listType = (aliasNames: string[]) =>
  z.lazy(() =>
    z
      .object({
        type: z.literal('list'),
        of: type(aliasNames),
      })
      .strict()
  );

export const mapType = (aliasNames: string[]) =>
  z.lazy(() =>
    z
      .object({
        type: z.literal('map'),
        fields: z.record(field(aliasNames)),
      })
      .strict()
  );

export const unionType = (aliasNames: string[]) => z.lazy(() => z.array(type(aliasNames)));

export const aliasType = (aliasNames: string[]) => z.enum([...aliasNames] as [string, ...string[]]);

export const type = (aliasNames: string[]): z.ZodType<types.Type> =>
  primitiveType
    .or(literalType)
    .or(enumType)
    .or(tupleType(aliasNames))
    .or(listType(aliasNames))
    .or(mapType(aliasNames))
    .or(unionType(aliasNames))
    .or(aliasType(aliasNames));

export const field = (aliasNames: string[]): z.ZodType<types.Field> =>
  z
    .object({
      type: type(aliasNames),
      optional: z.boolean().optional(),
      docs: z.string().optional(),
    })
    .strict();

export const documentModel = (aliasNames: string[]) =>
  z
    .object({
      type: z.literal('document'),
      docs: z.string().optional(),
      fields: z.record(field(aliasNames)),
    })
    .strict();

export const aliasModel = (aliasNames: string[]) =>
  z
    .object({
      type: z.literal('alias'),
      docs: z.string().optional(),
      value: type(aliasNames),
    })
    .strict();

export const model = (aliasNames: string[]) =>
  z.discriminatedUnion('type', [documentModel(aliasNames), aliasModel(aliasNames)]);

export const definition = (aliasNames: string[]) => z.record(model(aliasNames));