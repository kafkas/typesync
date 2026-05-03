import type * as firestore from 'firebase-admin/firestore';

/** A string that uniquely identifies a user. */
export type Username = string;

export type AnyValue = any;

export type UnknownValue = unknown;

export type Empty = null;

export type Active = boolean;

export type Age = number;

export type CreatedAt = firestore.Timestamp;

export type TheAnswer = 42;

export type Color = 'red' | 'blue';

export type Coords = [number, number];

export type Tags = string[];

export type Lookup = Record<string, number>;

export type StringOrNumber = string | number;

export type Profile = Username;
