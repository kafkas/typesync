import { z } from 'zod';

/** A unique handle. */
export const UsernameSchema = z.string().describe('A unique handle.');
export type Username = z.infer<typeof UsernameSchema>;

export const UserSchema = z.strictObject({ name: z.lazy(() => UsernameSchema) });
export type User = z.infer<typeof UserSchema>;
