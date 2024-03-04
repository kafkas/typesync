import { z } from 'zod';
import type {
  DefAliasModel,
  DefDocumentModel,
  DefMapValueType,
  DefModel,
  DefModelField,
  DefValueType,
  Definition,
} from './types';

export const defEnumValueTypeSchema = z.object({
  type: z.literal('enum'),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string().or(z.number()),
    })
  ),
});

export const getDefMapValueTypeSchema = (aliasNames: string[]): z.ZodType<DefMapValueType> =>
  z.object({
    type: z.literal('map'),
    fields: z.record(getDefModelFieldSchema(aliasNames)),
  });

export const getDefValueTypeSchema = (aliasNames: string[]): z.ZodType<DefValueType> =>
  z
    .enum(['string', 'boolean', 'int', 'timestamp', ...aliasNames])
    .or(defEnumValueTypeSchema)
    .or(getDefMapValueTypeSchema(aliasNames));

export const getDefModelFieldSchema = (aliasNames: string[]): z.ZodType<DefModelField> =>
  z
    .object({
      type: getDefValueTypeSchema(aliasNames),
      optional: z.boolean().optional(),
      docs: z.string().optional(),
    })
    .strict();

export const getDefDocumentModelSchema = (aliasNames: string[]) =>
  z
    .object({
      type: z.literal('document'),
      docs: z.string().optional(),
      fields: z.record(getDefModelFieldSchema(aliasNames)),
    })
    .strict();

export const getDefAliasModelSchema = (aliasNames: string[]) =>
  z
    .object({
      type: z.literal('alias'),
      docs: z.string().optional(),
      value: getDefValueTypeSchema(aliasNames),
    })
    .strict();

export const getDefModelSchema = (aliasNames: string[]) =>
  z.discriminatedUnion('type', [getDefDocumentModelSchema(aliasNames), getDefAliasModelSchema(aliasNames)]);

export const getDefinitionSchema = (aliasNames: string[]) => z.record(getDefModelSchema(aliasNames));
