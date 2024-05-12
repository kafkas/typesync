import { StringBuilder } from '@proficient/ds';

import { assertNever } from '../util/assert.js';

export class RootCollection {
  public readonly type = 'root-collection';

  public constructor(
    public readonly id: string,
    public readonly documents: Document[]
  ) {}
}

export class SubCollection {
  public readonly type = 'sub-collection';

  public constructor(
    public readonly id: string,
    public readonly documents: Document[]
  ) {}
}

type Collection = RootCollection | SubCollection;

export class GenericDocument {
  public readonly type = 'generic-document';

  public constructor(
    public readonly genericId: string,
    public readonly parentCollection: Collection,
    public readonly subCollections: SubCollection[]
  ) {}
}

export class LiteralDocument {
  public readonly type = 'literal-document';

  public constructor(
    public readonly id: string,
    public readonly parentCollection: Collection,
    public readonly subCollections: SubCollection[]
  ) {}
}

export type Document = GenericDocument | LiteralDocument;

const TAB = '    ';

export function generateMermaidGraph(rootCollections: RootCollection[]): string {
  const b = new StringBuilder();
  b.append(`graph TD` + `\n`);

  rootCollections.forEach(rootCollection => {
    b.append(buildLinks(rootCollection));
  });

  return b.toString();
}

function buildLinks(collection: Collection) {
  const b = new StringBuilder();

  collection.documents.forEach(document => {
    if (document.type === 'generic-document') {
      b.append(TAB + collection.id + ' --> ' + `generic_${document.genericId}[${document.genericId}]` + `\n`);
      document.subCollections.forEach(subCollection => {
        b.append(TAB + `generic_${document.genericId}[${document.genericId}]` + ' --> ' + subCollection.id + `\n`);
        b.append(buildLinks(subCollection) + `\n`);
      });
    } else if (document.type === 'literal-document') {
      // TODO: Implement
      throw new Error('Unimplemented');
    } else {
      assertNever(document);
    }
  });

  return b.toString();
}
