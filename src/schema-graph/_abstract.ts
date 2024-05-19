import { assertNever } from '../util/assert.js';
import type {
  CollectionChildren,
  DocumentChildren,
  GenericDocument,
  GenericSubCollection,
  LiteralDocument,
  LiteralSubCollection,
} from './impl.js';
import type { CollectionChildrenJson, DocumentChildrenJson } from './json.js';

export abstract class AbstractCollection {
  public get children(): CollectionChildren {
    if (this.childrenJson.type === 'generic') {
      const { document } = this.childrenJson;
      return { type: 'generic', document: this.createGenericDocument(document.genericId, document.children) };
    } else if (this.childrenJson.type === 'literal') {
      const { documents } = this.childrenJson;
      return {
        type: 'literal',
        documents: documents
          .map(document => this.createLiteralDocument(document.id, document.children))
          .sort((d1, d2) => d1.id.localeCompare(d2.id)),
      };
    } else {
      assertNever(this.childrenJson);
    }
  }

  protected abstract createGenericDocument(
    genericId: string,
    childrenJson: DocumentChildrenJson | null
  ): GenericDocument;

  protected abstract createLiteralDocument(id: string, childrenJson: DocumentChildrenJson | null): LiteralDocument;

  protected constructor(protected childrenJson: CollectionChildrenJson) {}
}

export abstract class AbstractDocument {
  public get children(): DocumentChildren | null {
    if (this.childrenJson === null) return null;
    if (this.childrenJson.type === 'generic') {
      const { collection } = this.childrenJson;
      return {
        type: 'generic',
        collection: this.createGenericSubCollection(collection.genericId, collection.children),
      };
    } else if (this.childrenJson.type === 'literal') {
      const { collections } = this.childrenJson;
      return {
        type: 'literal',
        collections: collections
          .map(collection => this.createLiteralSubCollection(collection.id, collection.children))
          .sort((c1, c2) => c1.id.localeCompare(c2.id)),
      };
    } else {
      assertNever(this.childrenJson);
    }
  }

  protected abstract createGenericSubCollection(
    genericId: string,
    childrenJson: CollectionChildrenJson
  ): GenericSubCollection;

  protected abstract createLiteralSubCollection(id: string, childrenJson: CollectionChildrenJson): LiteralSubCollection;

  protected constructor(protected childrenJson: DocumentChildrenJson | null) {}
}
