import * as firestore from 'firebase-admin/firestore';
import { z } from 'zod';

/** A unique handle. */
export const UsernameSchema = z.string().describe('A unique handle.');

/** A user document. */
export const UserSchema = z
  .strictObject({
    name: z.lazy(() => UsernameSchema).describe('The user name'),
    createdAt: z.instanceof(firestore.Timestamp),
  })
  .describe('A user document.');
