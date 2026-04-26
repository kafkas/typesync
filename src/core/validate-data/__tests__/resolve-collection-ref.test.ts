import {
  extractCollectionName,
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
