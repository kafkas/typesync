import type { schema } from '../../schema';

export class AliasModelImpl implements schema.AliasModel {
  public readonly type = 'alias';

  public constructor(
    public readonly name: string,
    public readonly docs: string | undefined,
    public readonly value: schema.types.Type
  ) {}
}
