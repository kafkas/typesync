import * as firestore from 'firebase-admin/firestore';
import { z } from 'zod';

/** A user-interaction event. */
export const EventSchema = z
  .discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('click'), x: z.number().int() }),
    z.strictObject({ kind: z.literal('scroll'), dy: z.number().int() }),
  ])
  .describe('A user-interaction event.');

export const RoleSchema = z.enum(['admin', 'user']);

export const TagSchema = z.array(z.string());

/** Unique user handle. */
export const UsernameSchema = z.string().describe('Unique user handle.');

/** A user document. */
export const UserSchema = z
  .strictObject({
    username: z.lazy(() => UsernameSchema).describe("The user's chosen handle."),
    role: z.lazy(() => RoleSchema),
    tags: z.lazy(() => TagSchema).optional(),
    createdAt: z.instanceof(firestore.Timestamp).describe('When the user signed up.'),
    avatar: z.instanceof(Buffer).optional(),
    bio: z.record(z.string(), z.string()).optional(),
  })
  .describe('A user document.');
