import type { firestore } from 'firebase-admin-11';

export type User = {
  createdAt: firestore.Timestamp;
};
