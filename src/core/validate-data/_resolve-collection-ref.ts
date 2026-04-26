import type { firestore } from 'firebase-admin';

import { assertDefined } from '../../util/assert.js';

/**
 * Result of resolving a Typesync document model path to a Firestore reference plus a
 * structural path matcher.
 */
export interface ResolvedCollectionRef {
  /**
   * Human-readable label used by progress events. For top-level model paths this is the
   * collection name (e.g. `users`); for nested model paths it is the full model path
   * template (e.g. `users/{userId}/posts/{postId}`) because the leaf collection name
   * alone is ambiguous when several models share the same leaf.
   */
  label: string;
  /**
   * The Firestore query to traverse. For top-level paths this is a `CollectionReference`;
   * for nested paths it is a `CollectionGroup` of the leaf collection.
   */
  ref: firestore.Query;
  /**
   * Whether `ref` is a collection-group query. Callers should use `matchesPath` to
   * filter results when this is `true`, since Firestore returns every collection with
   * the same leaf name regardless of parent path.
   */
  isCollectionGroup: boolean;
  /**
   * Predicate that returns `true` if the given Firestore document path matches the
   * model's path template. Always safe to call. For top-level model paths this is
   * effectively a no-op because the underlying `CollectionReference` is already exact;
   * for nested paths it discriminates between collections that share a leaf name but
   * live under different parents (e.g. `users/{u}/posts/{p}` vs
   * `workspaces/{w}/posts/{p}`).
   */
  matchesPath: (docRefPath: string) => boolean;
}

/**
 * Derives the Firestore reference and a path matcher for a Typesync document model
 * path.
 *
 * Typesync document paths look like `users/{userId}` or `users/{userId}/posts/{postId}`.
 * Top-level models (single collection segment) resolve to a `CollectionReference`; nested
 * models resolve to a `CollectionGroup` of the leaf collection plus a matcher that
 * filters out documents whose ancestor segments don't match the model's path template.
 *
 * Why the matcher: Firestore's `collectionGroup(name)` returns every collection named
 * `name` in the database, regardless of parent. Without a structural filter, two models
 * that happen to share a leaf name (e.g. `users/{u}/posts/{p}` and
 * `workspaces/{w}/posts/{p}`) would each pull in the other's documents and falsely
 * report them as validation failures.
 */
export function resolveCollectionRef(db: firestore.Firestore, modelPath: string): ResolvedCollectionRef {
  const modelSegments = parseModelSegments(modelPath);
  const isTopLevel = modelSegments.length === 2;

  if (isTopLevel) {
    const collectionName = modelSegments[0];
    assertDefined(collectionName, 'Internal error: top-level model path is missing a collection segment.');
    return {
      label: collectionName,
      ref: db.collection(collectionName),
      isCollectionGroup: false,
      matchesPath: () => true,
    };
  }

  const leafName = leafCollectionName(modelSegments);
  return {
    label: modelPath,
    ref: db.collectionGroup(leafName),
    isCollectionGroup: true,
    matchesPath: makeModelPathMatcher(modelSegments),
  };
}

/**
 * Splits a model path into its segments and validates the overall shape. Throws on any
 * malformed input so the caller can surface a clear error before doing any I/O.
 */
export function parseModelSegments(modelPath: string): string[] {
  const segments = modelPath.split('/').filter(s => s.length > 0);
  if (segments.length < 2 || segments.length % 2 !== 0) {
    throw new Error(
      `Invalid document model path '${modelPath}'. Expected an even number of segments ending with a dynamic id (e.g. 'users/{userId}').`
    );
  }
  return segments;
}

/**
 * Returns the collection name that should be passed to Firestore's `collectionGroup`
 * (or `collection`) factory for the given model path — i.e. the segment immediately
 * before the final dynamic id.
 *
 * @example
 * extractCollectionName('users/{userId}') // => 'users'
 * extractCollectionName('users/{userId}/posts/{postId}') // => 'posts'
 */
export function extractCollectionName(modelPath: string): string {
  const segments = parseModelSegments(modelPath);
  return leafCollectionName(segments);
}

function leafCollectionName(modelSegments: string[]): string {
  const idx = modelSegments.length - 2;
  const name = modelSegments[idx];
  assertDefined(name, 'Internal error: model path is missing the leaf collection segment.');
  if (isPlaceholder(name)) {
    throw new Error(`Invalid document model path. Collection name segment cannot be a placeholder: '${name}'.`);
  }
  return name;
}

/**
 * Builds a predicate that returns true if a Firestore document path conforms to the
 * given model path template. Even-indexed segments (collections) must match literally;
 * odd-indexed segments (document ids) are wildcards when written as `{name}` and must
 * match literally otherwise (this supports schemas that pin a specific parent doc id
 * like `static/data/users/{userId}`).
 */
export function makeModelPathMatcher(modelSegments: string[]): (docRefPath: string) => boolean {
  return docRefPath => {
    const docSegments = docRefPath.split('/').filter(s => s.length > 0);
    if (docSegments.length !== modelSegments.length) return false;
    for (let i = 0; i < modelSegments.length; i++) {
      const expected = modelSegments[i];
      const actual = docSegments[i];
      // Both arrays are bound by the length check above, so these are defined; the
      // assertion exists to convey that to TypeScript without resorting to a non-null
      // assertion operator.
      assertDefined(expected);
      assertDefined(actual);
      const isDocIdSlot = i % 2 === 1;
      if (isDocIdSlot && isPlaceholder(expected)) {
        if (actual.length === 0) return false;
        continue;
      }
      if (expected !== actual) return false;
    }
    return true;
  };
}

function isPlaceholder(segment: string): boolean {
  return segment.startsWith('{') && segment.endsWith('}');
}
