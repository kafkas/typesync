import { InvalidSchemaTypeError } from '../../errors/invalid-schema-type.js';
import { type } from './zod-schemas.js';

export function validateType(t: unknown) {
  const parseRes = type.safeParse(t);

  if (!parseRes.success) {
    const { error } = parseRes;
    const [issue] = error.issues;
    if (issue) {
      const { message } = issue;
      throw new InvalidSchemaTypeError(message);
    } else {
      throw new InvalidSchemaTypeError('Cannot parse type due to an unexpected error.');
    }
  }

  return parseRes.data;
}
