import { schema } from '../../schema/index.js';
import { createSchemaGraphFromSchema } from '../create-from-schema.js';
import { createSchemaGraph } from '../impl.js';

describe('createSchemaGraphFromSchema()', () => {
  it(`correctly builds a SchemaGraph from a Schema`, () => {
    const buildInputSchema = () => {
      const bookModel = schema.createDocumentModel({
        name: 'Book',
        docs: null,
        type: { type: 'object', fields: [], additionalFields: true },
        path: 'books/{bookId}',
      });
      const reviewModel = schema.createDocumentModel({
        name: 'Review',
        docs: null,
        type: { type: 'object', fields: [], additionalFields: true },
        path: 'books/{bookId}/reviews/{reviewId}',
      });
      const chapterModel = schema.createDocumentModel({
        name: 'Chapter',
        docs: null,
        type: { type: 'object', fields: [], additionalFields: true },
        path: 'books/{bookId}/chapters/{chapterId}',
      });
      const translationModel = schema.createDocumentModel({
        name: 'Translation',
        docs: null,
        type: { type: 'object', fields: [], additionalFields: true },
        path: 'books/{bookId}/translations/{translationId}',
      });
      const authorModel = schema.createDocumentModel({
        name: 'Author',
        docs: null,
        type: { type: 'object', fields: [], additionalFields: true },
        path: 'authors/{authorId}',
      });
      return schema.createSchemaWithModels([bookModel, reviewModel, chapterModel, translationModel, authorModel]);
    };

    const inputSchema = buildInputSchema();

    const expectedGraph = createSchemaGraph({
      root: {
        type: 'literal',
        collections: [
          {
            type: 'literal',
            id: 'authors',
            children: {
              type: 'generic',
              document: { type: 'generic-document', genericId: 'authorId', children: null },
            },
          },
          {
            type: 'literal',
            id: 'books',
            children: {
              type: 'generic',
              document: {
                type: 'generic-document',
                genericId: 'bookId',
                children: {
                  type: 'literal',
                  collections: [
                    {
                      type: 'literal',
                      id: 'chapters',
                      children: {
                        type: 'generic',
                        document: { type: 'generic-document', genericId: 'chapterId', children: null },
                      },
                    },
                    {
                      type: 'literal',
                      id: 'reviews',
                      children: {
                        type: 'generic',
                        document: { type: 'generic-document', genericId: 'reviewId', children: null },
                      },
                    },

                    {
                      type: 'literal',
                      id: 'translations',
                      children: {
                        type: 'generic',
                        document: { type: 'generic-document', genericId: 'translationId', children: null },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    });

    const graph = createSchemaGraphFromSchema(inputSchema);

    expect(graph.equals(expectedGraph)).toBe(true);
  });
});
