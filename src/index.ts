import { TypeSyncImpl } from './internal';
import { TypeSync } from './api';

export function createTypeSync(): TypeSync {
  return new TypeSyncImpl();
}
