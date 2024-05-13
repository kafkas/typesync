abstract class CollectionBase {
  public genericDocument: GenericDocument | null = null;
  protected readonly literalDocumentsById = new Map<string, LiteralDocument>();

  public get literalDocuments() {
    return Array.from(this.literalDocumentsById.values());
  }

  protected constructor(public readonly id: string) {}

  protected validateSetGenericDocument() {
    if (this.genericDocument !== null) {
      throw new Error(
        `The root collection '${this.id}' already has a generic document with the generic ID '${this.genericDocument.genericId}'.`
      );
    }
    const literalDocCount = this.literalDocumentsById.size;
    if (literalDocCount > 0) {
      throw new Error(
        `The root collection '${this.id}' already has ${literalDocCount} literal documents. A collection may not contain both literal and generic documents at the same time.`
      );
    }
  }

  protected validateAddLiteralDocument(id: string) {
    if (this.genericDocument !== null) {
      throw new Error(
        `The root collection '${this.id}' already has a generic document with the generic ID '${this.genericDocument.genericId}'. A collection may not contain both literal and generic documents at the same time.`
      );
    }
    const existingDocument = this.literalDocumentsById.get(id);
    if (existingDocument !== undefined) {
      throw new Error(
        `The root collection '${this.id}' already has a literal document with the ID '${existingDocument.id}'.`
      );
    }
  }
}

export class RootCollection extends CollectionBase {
  public readonly type = 'root-collection';

  public get path() {
    return this.id;
  }

  public constructor(id: string) {
    super(id);
  }

  public setGenericDocument(genericId: string) {
    this.validateSetGenericDocument();
    return (this.genericDocument = new GenericDocument(genericId, this));
  }

  public addLiteralDocument(id: string) {
    this.validateAddLiteralDocument(id);
    const doc = new LiteralDocument(id, this);
    this.literalDocumentsById.set(id, doc);
    return doc;
  }

  public traverse(cb: (node: Collection | Document) => void) {
    cb(this);
    if (this.genericDocument !== null) {
      this.genericDocument.traverse(cb);
    }
    this.literalDocumentsById.forEach(literalDocument => {
      literalDocument.traverse(cb);
    });
  }
}

export class SubCollection extends CollectionBase {
  public readonly type = 'sub-collection';

  public get path() {
    return `${this.parent.path}/${this.id}`;
  }

  public constructor(
    id: string,
    public readonly parent: Document
  ) {
    super(id);
  }

  public setGenericDocument(genericId: string) {
    this.validateSetGenericDocument();
    return (this.genericDocument = new GenericDocument(genericId, this));
  }

  public addLiteralDocument(id: string) {
    this.validateAddLiteralDocument(id);
    const doc = new LiteralDocument(id, this);
    this.literalDocumentsById.set(id, doc);
    return doc;
  }

  public traverse(cb: (node: Collection | Document) => void) {
    cb(this);
    if (this.genericDocument !== null) {
      this.genericDocument.traverse(cb);
    }
    this.literalDocumentsById.forEach(literalDocument => {
      literalDocument.traverse(cb);
    });
  }
}

export type Collection = RootCollection | SubCollection;

abstract class DocumentBase {
  protected readonly subCollectionsById = new Map<string, SubCollection>();

  public get subCollections() {
    return Array.from(this.subCollectionsById.values());
  }

  protected constructor(public readonly parent: Collection) {}

  public abstract readonly id: string;

  public get path(): string {
    return `${this.parent.path}/${this.id}`;
  }

  protected validateAddSubCollection(id: string) {
    const existingCol = this.subCollectionsById.get(id);
    if (existingCol !== undefined) {
      throw new Error(`The document '${this.path}' already has the '${id}' sub-collection.`);
    }
  }
}

export class GenericDocument extends DocumentBase {
  public readonly type = 'generic-document';

  public get id() {
    return this.genericIdWithBraces;
  }

  public get genericIdWithBraces() {
    return `{${this.genericId}}`;
  }

  public constructor(
    public readonly genericId: string,
    parent: Collection
  ) {
    super(parent);
  }

  public addSubCollection(id: string) {
    this.validateAddSubCollection(id);
    const col = new SubCollection(id, this);
    this.subCollectionsById.set(id, col);
    return col;
  }

  public traverse(cb: (node: Collection | Document) => void) {
    cb(this);
    this.subCollectionsById.forEach(subCollection => {
      subCollection.traverse(cb);
    });
  }
}

export class LiteralDocument extends DocumentBase {
  public readonly type = 'literal-document';

  public constructor(
    public readonly id: string,
    parent: Collection
  ) {
    super(parent);
  }

  public addSubCollection(id: string) {
    this.validateAddSubCollection(id);
    const col = new SubCollection(id, this);
    this.subCollectionsById.set(id, col);
    return col;
  }

  public traverse(cb: (node: Collection | Document) => void) {
    cb(this);
    this.subCollectionsById.forEach(subCollection => {
      subCollection.traverse(cb);
    });
  }
}

export type Document = GenericDocument | LiteralDocument;

export class SchemaGraph {
  private readonly rootCollectionsById = new Map<string, RootCollection>();

  public get rootCollections() {
    return Array.from(this.rootCollectionsById.values());
  }

  public addRootCollection(id: string) {
    const existingCol = this.rootCollectionsById.get(id);
    if (existingCol !== undefined) {
      throw new Error(`The schema graph already has the '${id}' root collection.`);
    }
    const col = new RootCollection(id);
    this.rootCollectionsById.set(id, col);
    return col;
  }

  public traverse(cb: (node: Collection | Document) => void) {
    this.rootCollectionsById.forEach(rootCollection => {
      rootCollection.traverse(cb);
    });
  }
}
