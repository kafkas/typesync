import * as firestore from 'firebase-admin/firestore';
import { z } from 'zod-v4';

/** Represents a user's role within a project. */
export const UserRoleSchema = z
  .enum(['owner', 'admin', 'member'])
  .describe("Represents a user's role within a project.");
export type UserRole = z.infer<typeof UserRoleSchema>;

/** Represents a user that belongs to a project. */
export const UserSchema = z
  .strictObject({
    username: z.string().describe('A string that uniquely identifies the user within a project.'),
    role: z.lazy(() => UserRoleSchema),
    created_at: z.instanceof(firestore.Timestamp),
  })
  .describe('Represents a user that belongs to a project.');
export type User = z.infer<typeof UserSchema>;
