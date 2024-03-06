import { firestore } from 'firebase-admin';

export type Username = string;
/**
 * Represents a user role
 */
export type UserRole = 'admin' | 'user' | 'guest';
export type Address = {
  street: string;
  city: string;
  zip_code: string;
};
export type Cat = {
  type: 'cat';
  name: string;
  lives_left: number;
};
export type Dog = {
  type: 'dog';
  name: string;
  breed: string;
};
export type Pet = Cat | Dog;
/**
 * User profile model
 */
export interface UserProfile {
  username: Username;
  age: number;
  role: UserRole;
  created_at?: firestore.Timestamp;
  location: [number, number];
  address: Address;
  favorite_numbers: number[];
  pets: Pet[];
  bio: null | string;
  area_code: 34;
}
