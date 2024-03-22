import { type GenerationPlatform } from '../api';
import { assertNeverNoThrow } from '../util/assert';

export function isGenerationPlatform(candidate: string): candidate is GenerationPlatform {
  const c = candidate as GenerationPlatform;
  switch (c) {
    case 'ts:firebase-admin:11':
    case 'py:firebase-admin:6':
      return true;
    default:
      assertNeverNoThrow(c);
      return false;
  }
}
