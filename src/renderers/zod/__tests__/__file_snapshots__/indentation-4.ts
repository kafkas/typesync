import { z } from 'zod';

export const ProfileSchema = z.strictObject({
    id: z.string().describe('The profile ID'),
    bio: z.string().optional().describe('A short bio about the user'),
    avatarUrl: z.string().optional(),
});
