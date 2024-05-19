import {
  ModelPathContainsLeadingSlashError,
  ModelPathContainsTrailingSlashError,
  ModelPathInvalidError,
  ModelPathRefersToCollectionError,
} from '../../errors/invalid-model.js';
import { type PathSegment, extractModelPathSegments } from '../_extract-model-path-segments.js';

describe('extractModelPathSegments()', () => {
  it(`throws ModelPathRefersToCollectionError if path refers to a collection`, () => {
    const collectionPaths = [
      'users',
      '{collectionId}',
      'users/{userId}/projects',
      '{collectionId}/{documentId}/{subCollectionId}',
    ];
    collectionPaths.forEach(path => {
      expect(() => extractModelPathSegments('Example', path)).toThrow(ModelPathRefersToCollectionError);
    });
  });

  it(`throws ModelPathContainsLeadingSlashError if path contains a leading slash`, () => {
    const paths = ['/users/{userId}', '/{rootColId}/{docId}', '/users/{userId}/projects/{projectId}'];
    paths.forEach(path => {
      expect(() => extractModelPathSegments('Example', path)).toThrow(ModelPathContainsLeadingSlashError);
    });
  });

  it(`throws ModelPathContainsTrailingSlashError if path contains a trailing slash`, () => {
    const paths = ['users/{userId}/', '{rootColId}/{docId}/', 'users/{userId}/projects/{projectId}/'];
    paths.forEach(path => {
      expect(() => extractModelPathSegments('Example', path)).toThrow(ModelPathContainsTrailingSlashError);
    });
  });

  it(`throws ModelPathInvalidError if path is otherwise invalid`, () => {
    const paths = [
      '',
      '{}',
      '{}/{}',
      'users/{}',
      'users//{userId}',
      'users///{userId}',
      'users/{{userId}}',
      'users/{{userId}',
      'users/{userId}}',
      'abc{def}/ghi',
      '{abc}def/ghi',
      'abc/{def}ghi',
      'abc/def{ghi}',
    ];
    paths.forEach(path => {
      expect(() => extractModelPathSegments('Example', path)).toThrow(ModelPathInvalidError);
    });
  });

  it(`correctly extracts path segments for level=1`, () => {
    const segments = extractModelPathSegments('Example', 'users/{userId}');
    const expectedSegments: PathSegment[] = [
      {
        type: 'collection',
        id: 'users',
        level: 0,
        path: 'users',
        parentPath: null,
      },
      {
        type: 'document',
        id: '{userId}',
        level: 1,
        path: 'users/{userId}',
        parentPath: 'users',
      },
    ];
    expect(segments).toEqual(expectedSegments);
  });

  it(`correctly extracts path segments for level=3`, () => {
    const segments = extractModelPathSegments('Example', '{rootColId}/{subColId}/projects/{projectId}');
    const expectedSegments: PathSegment[] = [
      {
        type: 'collection',
        id: '{rootColId}',
        level: 0,
        path: '{rootColId}',
        parentPath: null,
      },
      {
        type: 'document',
        id: '{subColId}',
        level: 1,
        path: '{rootColId}/{subColId}',
        parentPath: '{rootColId}',
      },
      {
        type: 'collection',
        id: 'projects',
        level: 2,
        path: '{rootColId}/{subColId}/projects',
        parentPath: '{rootColId}/{subColId}',
      },
      {
        type: 'document',
        id: '{projectId}',
        level: 3,
        path: '{rootColId}/{subColId}/projects/{projectId}',
        parentPath: '{rootColId}/{subColId}/projects',
      },
    ];
    expect(segments).toEqual(expectedSegments);
  });

  it(`does not throw if path is valid`, () => {
    const paths = [
      'users/{userId}',
      'users/{userId}/projects/{projectId}',
      '{rootColId}/{subColId}/projects/{projectId}',
      '{rootColId}/{subColId}/projects/project123',
      'static/data/users/{userId}',
      'static/data/{colId}/{userId}',
    ];
    paths.forEach(path => {
      expect(() => extractModelPathSegments('Example', path)).not.toThrow();
    });
  });
});
