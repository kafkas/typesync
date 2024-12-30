import type { firestore } from 'firebase-admin-10';

export type User = {
  createdAt: firestore.Timestamp;
};
