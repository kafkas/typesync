import { converters } from '../../converters';
import { schema } from '../../schema';
import type { TSDeclaration, TSGeneration, TSGenerator, TSGeneratorConfig } from './_types';

class TSGeneratorImpl implements TSGenerator {
  public constructor(private readonly config: TSGeneratorConfig) {}

  public generate(s: schema.Schema): TSGeneration {
    const { aliasModels, documentModels } = s;
    const declarations: TSDeclaration[] = [];

    aliasModels.forEach(model => {
      const tsType = converters.schema.typeToTS(model.value);
      declarations.push({ type: 'alias', modelName: model.name, modelType: tsType });
    });

    documentModels.forEach(model => {
      // A Firestore document can be considered an 'object' type
      const tsType = converters.schema.objectTypeToTS({ type: 'object', fields: model.fields });
      declarations.push({ type: 'interface', modelName: model.name, modelType: tsType });
    });

    return { type: 'ts', declarations };
  }
}

export function createTSGenerator(config: TSGeneratorConfig): TSGenerator {
  return new TSGeneratorImpl(config);
}
