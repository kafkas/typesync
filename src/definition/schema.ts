import { z } from 'zod';

export const defPrimitiveValueTypeSchema = z.enum(['string', 'boolean', 'int']);

export const defEnumValueTypeSchema = z.object({
  type: z.literal('enum'),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string().or(z.number()),
    })
  ),
});

export const defComplexValueTypeSchema = defEnumValueTypeSchema;

export const defValueTypeSchema = defPrimitiveValueTypeSchema.or(defComplexValueTypeSchema);

export const defModelFieldSchema = z
  .object({
    type: defValueTypeSchema,
    optional: z.boolean().optional(),
    docs: z.string().optional(),
  })
  .strict();

export const defDocumentModelSchema = z
  .object({
    type: z.literal('document'),
    docs: z.string().optional(),
    fields: z.record(defModelFieldSchema),
  })
  .strict();

export const defAliasModelSchema = z
  .object({
    type: z.literal('alias'),
    docs: z.string().optional(),
    value: defValueTypeSchema,
  })
  .strict();

export const defModelSchema = z.discriminatedUnion('type', [defDocumentModelSchema, defAliasModelSchema]);

export const definitionSchema = z.record(defModelSchema);
