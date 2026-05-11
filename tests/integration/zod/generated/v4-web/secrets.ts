import * as firestore from 'firebase/firestore';
import { z } from 'zod-v4';

/** A document storing opaque binary material alongside metadata. */
export const SecretSchema = z
  .strictObject({
    label: z.string().describe('Human-readable label for the secret.'),
    payload: z
      .instanceof(firestore.Bytes as unknown as new (...args: never[]) => firestore.Bytes)
      .describe('Opaque binary blob (encrypted material, key bytes, etc.).'),
    checksum: z
      .instanceof(firestore.Bytes as unknown as new (...args: never[]) => firestore.Bytes)
      .describe('A second bytes field, e.g. a SHA-256 digest of the payload.'),
    shards: z
      .array(z.instanceof(firestore.Bytes as unknown as new (...args: never[]) => firestore.Bytes))
      .describe('Additional bytes blobs stored as a list to exercise bytes-in-list.'),
    created_at: z.instanceof(firestore.Timestamp),
  })
  .describe('A document storing opaque binary material alongside metadata.');
export type Secret = z.infer<typeof SecretSchema>;
