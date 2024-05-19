import { FrequencyTable } from '@proficient/ds';

import {
  ModelPathContainsLeadingSlashError,
  ModelPathContainsTrailingSlashError,
  ModelPathInvalidError,
  ModelPathRefersToCollectionError,
} from '../errors/invalid-model.js';

export interface PathSegment {
  type: 'collection' | 'document';
  id: string;
  level: number;
  path: string;
  parentPath: string | null;
}

export function extractModelPathSegments(modelName: string, modelPath: string): PathSegment[] {
  if (modelPath.startsWith('/')) {
    throw new ModelPathContainsLeadingSlashError(modelName, modelPath);
  }
  if (modelPath.endsWith('/')) {
    throw new ModelPathContainsTrailingSlashError(modelName, modelPath);
  }

  const isValidSegmentId = (part: string) => {
    if (part === '') return false;
    const ft = new FrequencyTable();
    for (const char of part) {
      ft.increment(char);
    }
    if (ft.frequencyOf('{') === 0 && ft.frequencyOf('}') === 0) {
      return true;
    } else {
      if (ft.frequencyOf('{') === 1 && ft.frequencyOf('}') === 1) {
        return part.charAt(0) === '{' && part.charAt(part.length - 1) === '}';
      } else {
        return false;
      }
    }
  };

  const parts = modelPath.split('/');
  const hasInvalidPart = parts.some(part => !isValidSegmentId(part));

  if (hasInvalidPart) {
    throw new ModelPathInvalidError(modelName, modelPath);
  }

  if (parts.length % 2 === 1) {
    throw new ModelPathRefersToCollectionError(modelName, modelPath);
  }

  return parts.map((part, partIdx) => ({
    type: partIdx % 2 === 0 ? 'collection' : 'document',
    id: part,
    level: partIdx,
    path: parts.slice(0, partIdx + 1).join('/'),
    parentPath: partIdx === 0 ? null : parts.slice(0, partIdx).join('/'),
  }));
}
