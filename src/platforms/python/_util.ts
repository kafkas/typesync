import { Type } from './_types.js';

export function canBeNone(type: Type) {
  if (type.type === 'none') return true;
  if (type.type === 'union') {
    for (const memberType of type.members) {
      const has = canBeNone(memberType);
      if (has) {
        return true;
      }
    }
  }
  return false;
}
