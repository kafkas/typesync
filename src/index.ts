import { TypeSyncImpl } from './internal';
import type { TypeSync, TypeSyncConfig } from './api';

export function createTypeSync(config: TypeSyncConfig): TypeSync {
  return new TypeSyncImpl(config);
}
