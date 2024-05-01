import { schema } from '../../schema/index.js';
import { flatObjectTypeToRules, flatTypeToRules } from './_converters.js';
import { flattenSchema } from './_flatten-schema.js';
import { FlatAliasModel, FlatDocumentModel } from './_schema.js';
import type {
  RulesDeclaration,
  RulesGeneration,
  RulesGenerator,
  RulesGeneratorConfig,
  RulesValidatorDeclaration,
} from './_types.js';

class RulesGeneratorImpl implements RulesGenerator {
  public constructor(private readonly config: RulesGeneratorConfig) {}

  public generate(s: schema.Schema): RulesGeneration {
    const flattenedSchema = flattenSchema(s);
    const { aliasModels, documentModels } = flattenedSchema;
    const declarations: RulesDeclaration[] = [];
    aliasModels.forEach(model => {
      const d = this.createValidatorDeclarationForFlatAliasModel(model);
      declarations.push(d);
    });
    documentModels.forEach(model => {
      const d = this.createValidatorDeclarationForFlatDocumentModel(model);
      declarations.push(d);
    });
    return { type: 'rules', declarations };
  }

  private createValidatorDeclarationForFlatAliasModel(model: FlatAliasModel): RulesValidatorDeclaration {
    const rulesType = flatTypeToRules(model.type);
    return {
      type: 'validator',
      modelName: model.name,
      modelType: rulesType,
    };
  }

  private createValidatorDeclarationForFlatDocumentModel(model: FlatDocumentModel): RulesValidatorDeclaration {
    const rulesType = flatObjectTypeToRules(model.type);
    return {
      type: 'validator',
      modelName: model.name,
      modelType: rulesType,
    };
  }
}

export function createRulesGenerator(config: RulesGeneratorConfig): RulesGenerator {
  return new RulesGeneratorImpl(config);
}