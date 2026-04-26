import {
  extractCollectionName,
  getUnsupportedTraversalReason,
  makeModelPathMatcher,
  parseModelSegments,
  resolveCollectionRef,
} from '../_resolve-collection-ref.js';

describe('extractCollectionName()', () => {
  it('extracts the top-level collection name from a top-level document path', () => {
    expect(extractCollectionName('users/{userId}')).toBe('users');
    expect(extractCollectionName('projects/{projectId}')).toBe('projects');
  });

  it('extracts the leaf collection name from a subcollection document path', () => {
    expect(extractCollectionName('users/{userId}/posts/{postId}')).toBe('posts');
    expect(extractCollectionName('orgs/{orgId}/projects/{projectId}/tasks/{taskId}')).toBe('tasks');
  });

  it('works with mixed literal-and-dynamic path segments', () => {
    expect(extractCollectionName('static/data/users/{userId}')).toBe('users');
  });

  it('throws if the path has an odd number of segments', () => {
    expect(() => extractCollectionName('users')).toThrow();
    expect(() => extractCollectionName('users/{userId}/posts')).toThrow();
  });

  it('throws if the path is empty', () => {
    expect(() => extractCollectionName('')).toThrow();
  });
});

describe('makeModelPathMatcher()', () => {
  it('matches the exact top-level path template', () => {
    const matches = makeModelPathMatcher(parseModelSegments('users/{userId}'));
    expect(matches('users/abc')).toBe(true);
    expect(matches('users/abc-123')).toBe(true);
  });

  it('rejects extra ancestor segments for top-level templates', () => {
    const matches = makeModelPathMatcher(parseModelSegments('users/{userId}'));
    expect(matches('workspaces/w1/users/u1')).toBe(false);
  });

  it('matches the exact nested path template', () => {
    const matches = makeModelPathMatcher(parseModelSegments('users/{userId}/posts/{postId}'));
    expect(matches('users/u1/posts/p1')).toBe(true);
  });

  it('rejects nested docs whose ancestor collection segments differ', () => {
    const matches = makeModelPathMatcher(parseModelSegments('users/{userId}/posts/{postId}'));
    // Same leaf collection name but a different parent collection — this is the
    // collision case that motivated the matcher in the first place.
    expect(matches('workspaces/w1/posts/p1')).toBe(false);
    expect(matches('orgs/o1/posts/p1')).toBe(false);
  });

  it('rejects docs whose depth differs from the template', () => {
    const matches = makeModelPathMatcher(parseModelSegments('users/{userId}/posts/{postId}'));
    expect(matches('users/u1')).toBe(false);
    expect(matches('users/u1/posts/p1/comments/c1')).toBe(false);
  });

  it('treats placeholder doc-id slots as wildcards', () => {
    const matches = makeModelPathMatcher(parseModelSegments('users/{userId}/posts/{postId}'));
    expect(matches('users/anything-here/posts/another-thing')).toBe(true);
  });

  it('requires exact matches on literal doc-id segments', () => {
    // A schema can pin a specific parent doc id (e.g. `static/data/...`); only that
    // exact id should match.
    const matches = makeModelPathMatcher(parseModelSegments('static/data/users/{userId}'));
    expect(matches('static/data/users/u1')).toBe(true);
    expect(matches('static/other/users/u1')).toBe(false);
  });

  it('rejects empty dynamic id segments', () => {
    const matches = makeModelPathMatcher(parseModelSegments('users/{userId}'));
    expect(matches('users/')).toBe(false);
  });
});

describe('resolveCollectionRef()', () => {
  // Minimal Firestore stub. We only need to confirm which factory got called and the
  // collection name passed in; the returned ref is opaque to the resolver.
  function createDbStub() {
    const calls = { collection: [] as string[], collectionGroup: [] as string[] };
    const stub = {
      collection(name: string) {
        calls.collection.push(name);
        return { __kind: 'CollectionReference', name } as unknown;
      },
      collectionGroup(name: string) {
        calls.collectionGroup.push(name);
        return { __kind: 'CollectionGroup', name } as unknown;
      },
    };
    return { db: stub as unknown as Parameters<typeof resolveCollectionRef>[0], calls };
  }

  it('resolves top-level paths to a CollectionReference and skips matching', () => {
    const { db, calls } = createDbStub();
    const resolved = resolveCollectionRef(db, 'users/{userId}');

    expect(calls.collection).toEqual(['users']);
    expect(calls.collectionGroup).toEqual([]);
    expect(resolved.isCollectionGroup).toBe(false);
    expect(resolved.label).toBe('users');
    // Top-level matcher is a no-op pass-through; everything Firestore returns through a
    // CollectionReference is by definition correct.
    expect(resolved.matchesPath('users/u1')).toBe(true);
  });

  it('resolves nested paths to a CollectionGroup and uses the model path as the label', () => {
    const { db, calls } = createDbStub();
    const resolved = resolveCollectionRef(db, 'users/{userId}/posts/{postId}');

    expect(calls.collection).toEqual([]);
    expect(calls.collectionGroup).toEqual(['posts']);
    expect(resolved.isCollectionGroup).toBe(true);
    // Full model path is used as the label so collisions on the leaf name remain
    // disambiguated in progress output.
    expect(resolved.label).toBe('users/{userId}/posts/{postId}');
    expect(resolved.matchesPath('users/u1/posts/p1')).toBe(true);
    expect(resolved.matchesPath('workspaces/w1/posts/p1')).toBe(false);
  });
});

describe('getUnsupportedTraversalReason()', () => {
  it('returns undefined for top-level paths', () => {
    expect(getUnsupportedTraversalReason('users/{userId}')).toBeUndefined();
    expect(getUnsupportedTraversalReason('projects/{projectId}')).toBeUndefined();
  });

  it('returns undefined for nested paths whose collection segments are all literal', () => {
    expect(getUnsupportedTraversalReason('users/{userId}/posts/{postId}')).toBeUndefined();
    expect(getUnsupportedTraversalReason('orgs/{orgId}/projects/{projectId}/tasks/{taskId}')).toBeUndefined();
  });

  it('returns undefined for paths with a literal pinned doc id', () => {
    // `data` is a pinned doc id at index 1 (an odd index), not a collection segment.
    expect(getUnsupportedTraversalReason('static/data/users/{userId}')).toBeUndefined();
  });

  it('returns a reason for the regression case (placeholder leaf collection segment)', () => {
    // ScriptOutput in the CIP schema: `system` (collection), `scripts` (literal doc id),
    // `{script_id}` (placeholder collection — unsupported), `{output_id}` (doc id).
    const reason = getUnsupportedTraversalReason('system/scripts/{script_id}/{output_id}');
    expect(reason).toBeDefined();
    expect(reason).toContain('{script_id}');
    expect(reason).toContain('position 2');
    expect(reason).toContain('collection-group');
  });

  it('returns a reason for a top-level placeholder collection', () => {
    const reason = getUnsupportedTraversalReason('{tenant_id}/{tenantDoc}');
    expect(reason).toBeDefined();
    expect(reason).toContain('{tenant_id}');
    expect(reason).toContain('position 0');
  });

  it('lists every placeholder collection segment when multiple are present', () => {
    // Hypothetical schema with two wildcard collection levels under a literal root.
    // Even segment count and well-formed; just unsupported by collection-group.
    const reason = getUnsupportedTraversalReason('root/literalDoc/{group_id}/{group_doc}/{leaf_id}/{leafDoc}');
    expect(reason).toBeDefined();
    expect(reason).toContain('{group_id}');
    expect(reason).toContain('{leaf_id}');
  });

  it('throws (rather than returning a reason) for malformed paths', () => {
    // Structural malformation is a different problem; surfacing it as a thrown error
    // matches the rest of the path-handling helpers.
    expect(() => getUnsupportedTraversalReason('users')).toThrow();
    expect(() => getUnsupportedTraversalReason('')).toThrow();
  });
});

describe('extractCollectionName() — unsupported paths', () => {
  it('asserts (does not silently return a placeholder) when the leaf is a placeholder', () => {
    // Callers should filter via getUnsupportedTraversalReason() first; this assertion
    // keeps the helper honest if a future caller forgets that step.
    expect(() => extractCollectionName('system/scripts/{script_id}/{output_id}')).toThrow();
  });
});
