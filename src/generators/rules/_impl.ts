import { RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM } from '../../constants.js';
import { rules } from '../../platforms/rules/index.js';
import { schema } from '../../schema/index.js';
import { adjustSchemaForRules } from './_adjust-schema.js';
import { flatObjectTypeToRules, flatTypeToRules } from './_converters.js';
import type {
  RulesGeneration,
  RulesGenerator,
  RulesGeneratorConfig,
  RulesReadonlyFieldValidatorDeclaration,
  RulesTypeValidatorDeclaration,
} from './_types.js';

class RulesGeneratorImpl implements RulesGenerator {
  public constructor(private readonly config: RulesGeneratorConfig) {}

  public generate(s: schema.Schema): RulesGeneration {
    const adjustedSchema = adjustSchemaForRules(s);
    const { aliasModels, documentModels } = adjustedSchema;
    const typeValidatorDeclarations: RulesTypeValidatorDeclaration[] = [
      ...aliasModels.map(model => this.createTypeValidatorDeclarationForAliasModel(model.name, model.type)),
      ...documentModels.map(model => this.createTypeValidatorDeclarationForDocumentModel(model.name, model.type)),
    ];
    const readonlyFieldValidatorDeclarations: RulesReadonlyFieldValidatorDeclaration[] = [
      ...aliasModels
        .map(model => ({ modelName: model.name, modelType: model.type }))
        .filter(
          (params): params is { modelName: string; modelType: schema.rules.types.Object } =>
            params.modelType.type === 'object'
        )
        .map(params => this.createReadonlyFieldValidatorDeclarationForAliasModel(params.modelName, params.modelType)),
      ...documentModels.map(model =>
        this.createReadonlyFieldValidatorDeclarationForDocumentModel(model.name, model.type)
      ),
    ];
    return { type: 'rules', typeValidatorDeclarations, readonlyFieldValidatorDeclarations };
  }

  private createTypeValidatorDeclarationForAliasModel(
    modelName: string,
    modelType: schema.rules.types.Type
  ): RulesTypeValidatorDeclaration {
    const rulesType = flatTypeToRules(modelType);
    const predicate = rules.typePredicateForType(rulesType, this.config.typeValidatorParamName, {
      getTypeValidatorNameForModel: name => this.getTypeValidatorNameForModel(name),
    });
    return {
      type: 'type-validator',
      validatorName: this.getTypeValidatorNameForModel(modelName),
      paramName: this.config.typeValidatorParamName,
      predicate,
    };
  }

  private createTypeValidatorDeclarationForDocumentModel(
    modelName: string,
    modelType: schema.rules.types.Object
  ): RulesTypeValidatorDeclaration {
    const rulesType = flatObjectTypeToRules(modelType);
    const predicate = rules.typePredicateForType(rulesType, this.config.typeValidatorParamName, {
      getTypeValidatorNameForModel: name => this.getTypeValidatorNameForModel(name),
    });
    return {
      type: 'type-validator',
      validatorName: this.getTypeValidatorNameForModel(modelName),
      paramName: this.config.typeValidatorParamName,
      predicate,
    };
  }

  private getTypeValidatorNameForModel(modelName: string) {
    return this.config.typeValidatorNamePattern.replace(RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM, modelName);
  }

  private createReadonlyFieldValidatorDeclarationForAliasModel(
    modelName: string,
    _modelType: schema.rules.types.Object
  ): RulesReadonlyFieldValidatorDeclaration {
    // TODO: Implement
    const innerPredicates: rules.Predicate[] = [];
    const predicate: rules.Predicate = {
      type: 'or',
      innerPredicates,
    };
    return {
      type: 'readonly-field-validator',
      validatorName: this.getReadonlyFieldValidatorNameForModel(modelName),
      // TODO: Get from config
      prevDataParamName: 'prevData',
      nextDataParamName: 'nextData',
      predicate,
    };
  }

  private createReadonlyFieldValidatorDeclarationForDocumentModel(
    modelName: string,
    _modelType: schema.rules.types.Object
  ): RulesReadonlyFieldValidatorDeclaration {
    // TODO: Implement
    const innerPredicates: rules.Predicate[] = [];
    const predicate: rules.Predicate = {
      type: 'or',
      innerPredicates,
    };
    return {
      type: 'readonly-field-validator',
      validatorName: this.getReadonlyFieldValidatorNameForModel(modelName),
      // TODO: Get from config
      prevDataParamName: 'prevData',
      nextDataParamName: 'nextData',
      predicate,
    };
  }

  private getReadonlyFieldValidatorNameForModel(modelName: string) {
    // TODO: Implement with config
    return `isReadonlyFieldAffectedFor${modelName}`;
  }
}

export function createRulesGenerator(config: RulesGeneratorConfig): RulesGenerator {
  return new RulesGeneratorImpl(config);
}
