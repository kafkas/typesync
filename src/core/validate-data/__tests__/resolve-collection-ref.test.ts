import { extractCollectionName } from '../_resolve-collection-ref.js';

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
