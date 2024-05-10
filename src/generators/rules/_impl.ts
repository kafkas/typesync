import { rules } from '../../platforms/rules/index.js';
import { Schema, schema } from '../../schema/index.js';
import { adjustSchemaForRules } from './_adjust-schema.js';
import { flatObjectTypeToRules, flatTypeToRules } from './_converters.js';
import type {
  RulesDeclaration,
  RulesGeneration,
  RulesGenerator,
  RulesGeneratorConfig,
  RulesValidatorDeclaration,
} from './_types.js';

class RulesGeneratorImpl implements RulesGenerator {
  public constructor(private readonly config: RulesGeneratorConfig) {}

  public generate(s: Schema): RulesGeneration {
    const adjustedSchema = adjustSchemaForRules(s);
    const { aliasModels, documentModels } = adjustedSchema;
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

  private createValidatorDeclarationForFlatAliasModel(model: schema.rules.AliasModel): RulesValidatorDeclaration {
    const rulesType = flatTypeToRules(model.type);
    return {
      type: 'validator',
      modelName: model.name,
      modelType: rulesType,
    };
  }

  private createValidatorDeclarationForFlatDocumentModel(model: schema.rules.DocumentModel): RulesValidatorDeclaration {
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
