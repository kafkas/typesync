import { z } from 'zod';
import type { DefModelField, DefValueType } from './types';

export const defLiteralValueTypeSchema = z.object({
  type: z.literal('literal'),
  value: z.string().or(z.number()).or(z.boolean()),
});

export const defEnumValueTypeSchema = z.object({
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

export const getDefMapValueTypeSchema = (aliasNames: string[]) =>
  z.lazy(() =>
    z
      .object({
        type: z.literal('map'),
        fields: z.record(getDefModelFieldSchema(aliasNames)),
      })
      .strict()
  );

export const getDefUnionValueTypeSchema = (aliasNames: string[]) =>
  z.lazy(() => z.array(getDefValueTypeSchema(aliasNames)));

export const getDefValueTypeSchema = (aliasNames: string[]): z.ZodType<DefValueType> =>
  z
    .enum(['nil', 'string', 'boolean', 'int', 'timestamp', ...aliasNames])
    .or(defLiteralValueTypeSchema)
    .or(defEnumValueTypeSchema)
    .or(getDefMapValueTypeSchema(aliasNames))
    .or(getDefUnionValueTypeSchema(aliasNames));

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
