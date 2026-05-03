import type { firestore } from 'firebase-admin';

export type Username = string;

export type UserMetadata = unknown;

export interface Dog {
    name: string;
    breed: string;
}
