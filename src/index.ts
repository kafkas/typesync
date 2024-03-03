import { TypeSyncImpl } from './implementations';
import { TypeSync } from './interfaces';

export function createTypeSync(): TypeSync {
  return new TypeSyncImpl();
}
