import type { firestore } from 'firebase-admin-12';

export type User = {
  createdAt: firestore.Timestamp;
};
