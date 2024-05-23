import { schema } from '../../schema/index.js';
import { createSchemaGraphFromSchema } from '../create-from-schema.js';
import { createSchemaGraph } from '../impl.js';

describe('createSchemaGraphFromSchema()', () => {
  describe('correctly builds a SchemaGraph', () => {
    it(`for a simple schema with 2 root collections and 3 sub-collections`, () => {
      const buildInputSchema = () => {
        const authorModel = schema.createDocumentModel({
          name: 'Author',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'authors/{authorId}',
        });
        const bookModel = schema.createDocumentModel({
          name: 'Book',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'books/{bookId}',
        });
        const chapterModel = schema.createDocumentModel({
          name: 'Chapter',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'books/{bookId}/chapters/{chapterId}',
        });
        const reviewModel = schema.createDocumentModel({
          name: 'Review',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'books/{bookId}/reviews/{reviewId}',
        });
        const translationModel = schema.createDocumentModel({
          name: 'Translation',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'books/{bookId}/translations/{translationId}',
        });

        return schema.createSchemaWithModels([authorModel, bookModel, reviewModel, chapterModel, translationModel]);
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

    it(`for 4 deeply nested generic models with a generic root collection`, () => {
      const buildInputSchema = () => {
        const model1 = schema.createDocumentModel({
          name: 'Model1',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: '{root_col}/doc_1/sub_col_1/{model1_id}',
        });
        const model2 = schema.createDocumentModel({
          name: 'Model2',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: '{root_col}/doc_1/sub_col_2/{model2_id}',
        });
        const model3 = schema.createDocumentModel({
          name: 'Model3',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: '{root_col}/doc_2/sub_col_1/{model3_id}',
        });
        const model4 = schema.createDocumentModel({
          name: 'Model4',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: '{root_col}/doc_2/sub_col_2/{model4_id}',
        });
        return schema.createSchemaWithModels([model1, model2, model3, model4]);
      };

      const inputSchema = buildInputSchema();

      const expectedGraph = createSchemaGraph({
        root: {
          type: 'generic',
          collection: {
            type: 'generic',
            genericId: 'root_col',
            children: {
              type: 'literal',
              documents: [
                {
                  type: 'literal-document',
                  id: 'doc_1',
                  children: {
                    type: 'literal',
                    collections: [
                      {
                        type: 'literal',
                        id: 'sub_col_1',
                        children: {
                          type: 'generic',
                          document: { type: 'generic-document', genericId: 'model1_id', children: null },
                        },
                      },
                      {
                        type: 'literal',
                        id: 'sub_col_2',
                        children: {
                          type: 'generic',
                          document: { type: 'generic-document', genericId: 'model2_id', children: null },
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'literal-document',
                  id: 'doc_2',
                  children: {
                    type: 'literal',
                    collections: [
                      {
                        type: 'literal',
                        id: 'sub_col_1',
                        children: {
                          type: 'generic',
                          document: { type: 'generic-document', genericId: 'model3_id', children: null },
                        },
                      },
                      {
                        type: 'literal',
                        id: 'sub_col_2',
                        children: {
                          type: 'generic',
                          document: { type: 'generic-document', genericId: 'model4_id', children: null },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      });

      const graph = createSchemaGraphFromSchema(inputSchema);

      expect(graph.equals(expectedGraph)).toBe(true);
    });

    it(`for a static literal document and generic documents in a sub-collection`, () => {
      const buildInputSchema = () => {
        const constantsModel = schema.createDocumentModel({
          name: 'Constants',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'static/constants',
        });
        const userModel = schema.createDocumentModel({
          name: 'User',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'static/data/users/{userId}',
        });
        const bookModel = schema.createDocumentModel({
          name: 'Book',
          docs: null,
          type: { type: 'object', fields: [], additionalFields: true },
          path: 'static/data/books/{bookId}',
        });
        return schema.createSchemaWithModels([constantsModel, userModel, bookModel]);
      };

      const inputSchema = buildInputSchema();

      const expectedGraph = createSchemaGraph({
        root: {
          type: 'literal',
          collections: [
            {
              type: 'literal',
              id: 'static',
              children: {
                type: 'literal',
                documents: [
                  {
                    type: 'literal-document',
                    id: 'constants',
                    children: null,
                  },
                  {
                    type: 'literal-document',
                    id: 'data',
                    children: {
                      type: 'literal',
                      collections: [
                        {
                          type: 'literal',
                          id: 'books',
                          children: {
                            type: 'generic',
                            document: {
                              type: 'generic-document',
                              genericId: 'bookId',
                              children: null,
                            },
                          },
                        },
                        {
                          type: 'literal',
                          id: 'users',
                          children: {
                            type: 'generic',
                            document: {
                              type: 'generic-document',
                              genericId: 'userId',
                              children: null,
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      });

      const graph = createSchemaGraphFromSchema(inputSchema);

      expect(graph.equals(expectedGraph)).toBe(true);
    });
  });
});
