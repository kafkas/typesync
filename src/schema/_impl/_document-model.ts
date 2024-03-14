import { cloneDeep } from 'lodash';

import type { schema } from '../../schema';

export class DocumentModelImpl implements schema.DocumentModel {
  public readonly type = 'document';

  public get fields() {
    return Object.values(this.fieldsById);
  }

  public constructor(
    public readonly name: string,
    public readonly docs: string | undefined,
    private readonly fieldsById: Record<string, schema.types.Field>
  ) {}

  public clone() {
    return new DocumentModelImpl(this.name, this.docs, cloneDeep(this.fieldsById));
  }
}
