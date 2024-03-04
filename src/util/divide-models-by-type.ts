import type { schema } from '../interfaces';
import { assertNever } from './assert';

export function divideModelsByType(models: schema.Model[]) {
  const aliasModels: schema.AliasModel[] = [];
  const documentModels: schema.DocumentModel[] = [];
  models.forEach(model => {
    switch (model.type) {
      case 'alias':
        aliasModels.push(model);
        break;
      case 'document':
        documentModels.push(model);
        break;
      default:
        assertNever(model);
    }
  });
  return { aliasModels, documentModels };
}
