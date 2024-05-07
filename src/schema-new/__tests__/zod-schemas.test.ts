import { z } from 'zod';

import { assertEmpty } from '../../util/assert.js';
import { types } from '../types/index.js';
import { stringEnumType } from '../types/zod-schemas.js';

type IsExact<T, U> = [Required<T>] extends [Required<U>] ? ([Required<U>] extends [Required<T>] ? true : false) : false;

describe('zod schemas are consistent with type declarations', () => {
  it('string-enum', () => {
    type DeclaredType = types.StringEnum;
    type InferredType = z.infer<typeof stringEnumType>;
    assertEmpty<IsExact<DeclaredType, InferredType>>(true);
  });
});
