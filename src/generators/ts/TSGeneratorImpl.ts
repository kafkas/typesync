import { converters } from '../../converters';
import { generation } from '../../generation';
import type { TSGenerator, TSGeneratorConfig } from '../../interfaces';
import { schema } from '../../schema';

class TSGeneratorImpl implements TSGenerator {
  public constructor(private readonly config: TSGeneratorConfig) {}

  public generate(s: schema.Schema): generation.TSGeneration {
    const { aliasModels, documentModels } = s;
    const declarations: generation.TSDeclaration[] = [];

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
