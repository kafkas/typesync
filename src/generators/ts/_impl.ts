import { schema } from '../../schema/index.js';
import { objectTypeToTS, typeToTS } from './_converters.js';
import type { TSDeclaration, TSGeneration, TSGenerator, TSGeneratorConfig } from './_types.js';

class TSGeneratorImpl implements TSGenerator {
  public constructor(private readonly config: TSGeneratorConfig) {}

  public generate(s: schema.Schema): TSGeneration {
    const { aliasModels, documentModels } = s;
    const declarations: TSDeclaration[] = [];

    aliasModels.forEach(model => {
      const tsType = typeToTS(model.type);
      declarations.push({ type: 'alias', modelName: model.name, modelType: tsType, modelDocs: model.docs });
    });

    documentModels.forEach(model => {
      // A Firestore document can be considered an 'object' type
      const tsType = objectTypeToTS(model.type);
      declarations.push({ type: 'interface', modelName: model.name, modelType: tsType, modelDocs: model.docs });
    });

    return { type: 'ts', declarations };
  }
}

export function createTSGenerator(config: TSGeneratorConfig): TSGenerator {
  return new TSGeneratorImpl(config);
}
