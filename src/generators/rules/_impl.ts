import { rules } from '../../platforms/rules/index.js';
import { Schema } from '../../schema-new/index.js';
import { flatObjectTypeToRules, flatTypeToRules } from './_converters.js';
import { flattenSchema } from './_flatten-schema.js';
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

  private createValidatorDeclarationForFlatAliasModel(model: rules.schema.AliasModel): RulesValidatorDeclaration {
    const rulesType = flatTypeToRules(model.type);
    return {
      type: 'validator',
      modelName: model.name,
      modelType: rulesType,
    };
  }

  private createValidatorDeclarationForFlatDocumentModel(model: rules.schema.DocumentModel): RulesValidatorDeclaration {
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
