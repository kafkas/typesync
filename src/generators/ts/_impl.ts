import { ts } from '../../platforms/ts/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import { adjustSchemaForTS } from './_adjust-schema.js';
import { objectTypeToTS, typeToTS } from './_converters.js';
import type { TSDeclaration, TSGeneration, TSGenerator, TSGeneratorConfig } from './_types.js';

class TSGeneratorImpl implements TSGenerator {
  public constructor(private readonly config: TSGeneratorConfig) {}

  public generate(s: schema.Schema): TSGeneration {
    const adjustedSchema = adjustSchemaForTS(s);
    const { aliasModels, documentModels } = adjustedSchema;
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

  private createDeclarationForAliasModel(model: schema.ts.AliasModel): TSDeclaration {
    if (model.type.type === 'object') {
      const tsType = objectTypeToTS(model.type);
      return this.createDeclarationForObjectModel(model, tsType);
    } else {
      const tsType = typeToTS(model.type);
      return {
        type: 'alias',
        modelName: model.name,
        modelType: tsType,
        modelDocs: model.docs,
      };
    }
  }

  private createDeclarationForDocumentModel(model: schema.ts.DocumentModel): TSDeclaration {
    const tsType = objectTypeToTS(model.type);
    return this.createDeclarationForObjectModel(model, tsType);
  }

  private createDeclarationForObjectModel(
    model: schema.ts.AliasModel | schema.ts.DocumentModel,
    tsType: ts.Object
  ): TSDeclaration {
    switch (this.config.objectTypeFormat) {
      case 'interface':
        return {
          type: 'interface',
          modelName: model.name,
          modelType: tsType,
          modelDocs: model.docs,
        };
      case 'type-alias':
        return {
          type: 'alias',
          modelName: model.name,
          modelType: tsType,
          modelDocs: model.docs,
        };
      default:
        assertNever(this.config.objectTypeFormat);
    }
  }
}

export function createTSGenerator(config: TSGeneratorConfig): TSGenerator {
  return new TSGeneratorImpl(config);
}
