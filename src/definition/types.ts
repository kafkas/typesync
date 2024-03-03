import type { z } from 'zod';
import type {
  defPrimitiveValueTypeSchema,
  defEnumValueTypeSchema,
  defComplexValueTypeSchema,
  defValueTypeSchema,
  defModelFieldSchema,
  defDocumentModelSchema,
  defAliasModelSchema,
  defModelSchema,
  definitionSchema,
} from './schema';

export type DefPrimitiveValueType = z.infer<typeof defPrimitiveValueTypeSchema>;
export type DefEnumValueType = z.infer<typeof defEnumValueTypeSchema>;
export type DefComplexValueType = z.infer<typeof defComplexValueTypeSchema>;
export type DefValueType = z.infer<typeof defValueTypeSchema>;
export type DefModelField = z.infer<typeof defModelFieldSchema>;
export type DefDocumentModel = z.infer<typeof defDocumentModelSchema>;
export type DefAliasModel = z.infer<typeof defAliasModelSchema>;
export type DefModel = z.infer<typeof defModelSchema>;
export type Definition = z.infer<typeof definitionSchema>;
