import type * as firestore from 'firebase-admin/firestore';

/** A user profile */
export interface Profile {
  /** The profile ID */
  id: string;
  bio?: string;
  [K: string]: unknown;
}
