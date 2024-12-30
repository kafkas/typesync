import type * as firestore from 'firebase-10/firestore';

export type User = {
  createdAt: firestore.Timestamp;
};
