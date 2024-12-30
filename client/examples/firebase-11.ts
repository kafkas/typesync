import type * as firestore from 'firebase-11/firestore';

export type User = {
  createdAt: firestore.Timestamp;
};
