import { z } from 'zod';

export const defEnumValueTypeSchema = z.object({
  type: z.literal('enum'),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string().or(z.number()),
    })
  ),
});

export const getDefValueTypeSchema = (aliasNames: string[]) =>
  z.enum(['string', 'boolean', 'int', 'timestamp', ...aliasNames]).or(defEnumValueTypeSchema);

export const getDefModelFieldSchema = (aliasNames: string[]) =>
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
