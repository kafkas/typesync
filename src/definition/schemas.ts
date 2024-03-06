import { z } from 'zod';

import type { ModelField, ValueType } from './types';

export const primitiveValueType = z.enum(['nil', 'string', 'boolean', 'int', 'timestamp']);

export const literalValueType = z.object({
  type: z.literal('literal'),
  value: z.string().or(z.number()).or(z.boolean()),
});

export const enumValueType = z.object({
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

export const tupleValueType = (aliasNames: string[]) =>
  z.lazy(() =>
    z
      .object({
        type: z.literal('tuple'),
        values: z.array(valueType(aliasNames)),
      })
      .strict()
  );

export const listValueType = (aliasNames: string[]) =>
  z.lazy(() =>
    z
      .object({
        type: z.literal('list'),
        of: valueType(aliasNames),
      })
      .strict()
  );

export const mapValueType = (aliasNames: string[]) =>
  z.lazy(() =>
    z
      .object({
        type: z.literal('map'),
        fields: z.record(modelField(aliasNames)),
      })
      .strict()
  );

export const unionValueType = (aliasNames: string[]) => z.lazy(() => z.array(valueType(aliasNames)));

export const aliasValueType = (aliasNames: string[]) => z.enum([...aliasNames] as [string, ...string[]]);

export const valueType = (aliasNames: string[]): z.ZodType<ValueType> =>
  primitiveValueType
    .or(literalValueType)
    .or(enumValueType)
    .or(tupleValueType(aliasNames))
    .or(listValueType(aliasNames))
    .or(mapValueType(aliasNames))
    .or(unionValueType(aliasNames))
    .or(aliasValueType(aliasNames));

export const modelField = (aliasNames: string[]): z.ZodType<ModelField> =>
  z
    .object({
      type: valueType(aliasNames),
      optional: z.boolean().optional(),
      docs: z.string().optional(),
    })
    .strict();

export const documentModel = (aliasNames: string[]) =>
  z
    .object({
      type: z.literal('document'),
      docs: z.string().optional(),
      fields: z.record(modelField(aliasNames)),
    })
    .strict();

export const aliasModel = (aliasNames: string[]) =>
  z
    .object({
      type: z.literal('alias'),
      docs: z.string().optional(),
      value: valueType(aliasNames),
    })
    .strict();

export const model = (aliasNames: string[]) =>
  z.discriminatedUnion('type', [documentModel(aliasNames), aliasModel(aliasNames)]);

export const definition = (aliasNames: string[]) => z.record(model(aliasNames));
