import type * as firestore from 'firebase-admin-12/firestore';

export type User = {
  createdAt: firestore.Timestamp;
};
