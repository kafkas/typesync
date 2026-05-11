import { z } from 'zod';

/** Unique handle. */
export const UsernameSchema = z.string().describe('Unique handle.');
export type Username = z.infer<typeof UsernameSchema>;

export const UserSchema = z.strictObject({ name: z.lazy(() => UsernameSchema), age: z.number().int().optional() });
export type User = z.infer<typeof UserSchema>;
