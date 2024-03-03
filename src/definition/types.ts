import type { z } from 'zod';
import type {
  defEnumValueTypeSchema,
  getDefValueTypeSchema,
  getDefModelFieldSchema,
  getDefDocumentModelSchema,
  getDefAliasModelSchema,
  getDefModelSchema,
  getDefinitionSchema,
} from './schema';

export type DefEnumValueType = z.infer<typeof defEnumValueTypeSchema>;
export type DefValueType = z.infer<ReturnType<typeof getDefValueTypeSchema>>;
export type DefModelField = z.infer<ReturnType<typeof getDefModelFieldSchema>>;
export type DefDocumentModel = z.infer<ReturnType<typeof getDefDocumentModelSchema>>;
export type DefAliasModel = z.infer<ReturnType<typeof getDefAliasModelSchema>>;
export type DefModel = z.infer<ReturnType<typeof getDefModelSchema>>;
export type Definition = z.infer<ReturnType<typeof getDefinitionSchema>>;
