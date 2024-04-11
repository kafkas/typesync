import { Type } from './_types.js';

export function canBeNone(type: Type) {
  if (type.type === 'none') return true;
  if (type.type === 'simple-union') {
    for (const memberType of type.variants) {
      const canBe = canBeNone(memberType);
      if (canBe) {
        return true;
      }
    }
  }
  return false;
}
