import { schema } from '../../schema/index.js';
import { objectTypeToTS, typeToTS } from './_converters.js';
import type { TSDeclaration, TSGeneration, TSGenerator, TSGeneratorConfig } from './_types.js';

class TSGeneratorImpl implements TSGenerator {
  public constructor(private readonly config: TSGeneratorConfig) {}

  public generate(s: schema.Schema): TSGeneration {
    const { aliasModels, documentModels } = s;
    const declarations: TSDeclaration[] = [];
    aliasModels.forEach(model => {
      const d = this.createDeclarationForAliasModel(model);
      declarations.push(d);
    });
    documentModels.forEach(model => {
      const d = this.createDeclarationForDocumentModel(model);
      declarations.push(d);
    });
    return { type: 'ts', declarations };
  }

  private createDeclarationForAliasModel(model: schema.AliasModel): TSDeclaration {
    const tsType = typeToTS(model.type);
    return {
      type: 'alias',
      modelName: model.name,
      modelType: tsType,
      modelDocs: model.docs,
    };
  }

  private createDeclarationForDocumentModel(model: schema.DocumentModel): TSDeclaration {
    // A Firestore document can be considered an 'object' type
    const tsType = objectTypeToTS(model.type);
    return {
      type: 'interface',
      modelName: model.name,
      modelType: tsType,
      modelDocs: model.docs,
    };
  }
}

export function createTSGenerator(config: TSGeneratorConfig): TSGenerator {
  return new TSGeneratorImpl(config);
}
