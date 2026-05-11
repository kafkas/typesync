import * as firestore from 'firebase-admin/firestore';
import { z } from 'zod-v4';

/** A project document. */
export const ProjectSchema = z
  .strictObject({
    id: z.string().describe('Caller-supplied identifier preserved verbatim in the document body.'),
    display_name: z.string().describe('Human-readable label for the project.'),
    created_at: z.instanceof(firestore.Timestamp),
  })
  .describe('A project document.');
export type Project = z.infer<typeof ProjectSchema>;
