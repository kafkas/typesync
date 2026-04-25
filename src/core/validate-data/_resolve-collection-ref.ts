import type { firestore } from 'firebase-admin';

/**
 * Derives the collection (or collection-group) name from a Typesync document model
 * path and returns a matching Firestore reference.
 *
 * Typesync document paths look like `users/{userId}` or `users/{userId}/posts/{postId}`.
 * The leaf segment immediately before the final dynamic id is the collection name
 * that actually needs to be traversed.
 *
 * We always use `collectionGroup` so that subcollections are validated across every
 * parent automatically, with no need for callers to specify a parent. For top-level
 * collections this is equivalent to `firestore.collection(name)`.
 */
export function resolveCollectionRef(
  db: firestore.Firestore,
  modelPath: string
): {
  collectionName: string;
  ref: firestore.CollectionGroup;
} {
  const collectionName = extractCollectionName(modelPath);
  return { collectionName, ref: db.collectionGroup(collectionName) };
}

/**
 * Extracts the collection name for a Typesync document model path.
 *
 * @example
 * extractCollectionName('users/{userId}') // => 'users'
 * extractCollectionName('users/{userId}/posts/{postId}') // => 'posts'
 */
export function extractCollectionName(modelPath: string): string {
  const segments = modelPath.split('/').filter(s => s.length > 0);
  if (segments.length < 2 || segments.length % 2 !== 0) {
    throw new Error(
      `Invalid document model path '${modelPath}'. Expected an even number of segments ending with a dynamic id (e.g. 'users/{userId}').`
    );
  }
  // The collection name is the segment before the final (dynamic) doc id segment.
  const idx = segments.length - 2;
  const name = segments[idx];
  if (!name || name.startsWith('{')) {
    throw new Error(`Invalid document model path '${modelPath}'. Could not derive a collection name.`);
  }
  return name;
}
