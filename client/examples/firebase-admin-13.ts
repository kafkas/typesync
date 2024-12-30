import type * as firestore from 'firebase-admin-13/firestore';

export type User = {
  createdAt: firestore.Timestamp;
};
