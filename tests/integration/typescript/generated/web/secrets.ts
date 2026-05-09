import type * as firestore from 'firebase/firestore';

/** A document storing opaque binary material alongside metadata. */
export interface Secret {
  /** Human-readable label for the secret. */
  label: string;
  /** Opaque binary blob (encrypted material, key bytes, etc.). */
  payload: firestore.Bytes;
  /** A second bytes field, e.g. a SHA-256 digest of the payload. */
  checksum: firestore.Bytes;
  /** Additional bytes blobs stored as a list to exercise bytes-in-list. */
  shards: firestore.Bytes[];
  created_at: firestore.Timestamp;
}
