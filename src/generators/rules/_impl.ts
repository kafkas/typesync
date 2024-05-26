import { schema } from '../../schema/index.js';
import { adjustSchemaForRules } from './_adjust-schema.js';
import { flatObjectTypeToRules, flatTypeToRules } from './_converters.js';
import type {
  RulesDeclaration,
  RulesGeneration,
  RulesGenerator,
  RulesGeneratorConfig,
  RulesTypeValidatorDeclaration,
} from './_types.js';

class RulesGeneratorImpl implements RulesGenerator {
  public constructor(private readonly config: RulesGeneratorConfig) {}

  public generate(s: schema.Schema): RulesGeneration {
    const adjustedSchema = adjustSchemaForRules(s);
    const { aliasModels, documentModels } = adjustedSchema;
    const declarations: RulesDeclaration[] = [];
    aliasModels.forEach(model => {
      const d = this.createTypeValidatorDeclarationForFlatAliasModel(model);
      declarations.push(d);
    });
    documentModels.forEach(model => {
      const d = this.createTypeValidatorDeclarationForFlatDocumentModel(model);
      declarations.push(d);
    });
    return { type: 'rules', declarations };
  }

  private createTypeValidatorDeclarationForFlatAliasModel(
    model: schema.rules.AliasModel
  ): RulesTypeValidatorDeclaration {
    const rulesType = flatTypeToRules(model.type);
    return {
      type: 'type-validator',
      modelName: model.name,
      modelType: rulesType,
    };
  }

  private createTypeValidatorDeclarationForFlatDocumentModel(
    model: schema.rules.DocumentModel
  ): RulesTypeValidatorDeclaration {
    const rulesType = flatObjectTypeToRules(model.type);
    return {
      type: 'type-validator',
      modelName: model.name,
      modelType: rulesType,
    };
  }
}

export function createRulesGenerator(config: RulesGeneratorConfig): RulesGenerator {
  return new RulesGeneratorImpl(config);
}
