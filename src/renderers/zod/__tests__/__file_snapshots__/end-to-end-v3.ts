import { z } from 'zod';

export const LookupSchema = z.record(z.number().int());

export const LooseSchema = z.object({ id: z.string() }).passthrough();
