import {
  RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN_PARAM,
  RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM,
} from '../../constants.js';
import { schema } from '../../schema/index.js';
import { adjustSchemaForRules } from './_adjust-schema.js';
import { flatObjectTypeToRules, flatTypeToRules } from './_converters.js';
import { readonlyFieldPredicateForObjectType } from './_readonly-field-predicates.js';
import { typePredicateForType } from './_type-predicates.js';
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
        .map(params =>
          this.createReadonlyFieldValidatorDeclarationForAliasModel(params.modelName, params.modelType, adjustedSchema)
        ),
      ...documentModels.map(model =>
        this.createReadonlyFieldValidatorDeclarationForDocumentModel(model.name, model.type, adjustedSchema)
      ),
    ];
    return { type: 'rules', typeValidatorDeclarations, readonlyFieldValidatorDeclarations };
  }

  private createTypeValidatorDeclarationForAliasModel(
    modelName: string,
    modelType: schema.rules.types.Type
  ): RulesTypeValidatorDeclaration {
    const rulesType = flatTypeToRules(modelType);
    const predicate = typePredicateForType(rulesType, this.config.typeValidatorParamName, {
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
    const predicate = typePredicateForType(rulesType, this.config.typeValidatorParamName, {
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
    modelType: schema.rules.types.Object,
    s: schema.rules.Schema
  ): RulesReadonlyFieldValidatorDeclaration {
    const {
      readonlyFieldValidatorPrevDataParamName: prevDataParamName,
      readonlyFieldValidatorNextDataParamName: nextDataParamName,
    } = this.config;
    const predicate = readonlyFieldPredicateForObjectType(modelType, s, prevDataParamName, nextDataParamName, {
      getReadonlyFieldValidatorNameForModel: name => this.getReadonlyFieldValidatorNameForModel(name),
    });
    return {
      type: 'readonly-field-validator',
      validatorName: this.getReadonlyFieldValidatorNameForModel(modelName),
      prevDataParamName,
      nextDataParamName,
      predicate,
    };
  }

  private createReadonlyFieldValidatorDeclarationForDocumentModel(
    modelName: string,
    modelType: schema.rules.types.Object,
    s: schema.rules.Schema
  ): RulesReadonlyFieldValidatorDeclaration {
    const {
      readonlyFieldValidatorPrevDataParamName: prevDataParamName,
      readonlyFieldValidatorNextDataParamName: nextDataParamName,
    } = this.config;
    const predicate = readonlyFieldPredicateForObjectType(modelType, s, prevDataParamName, nextDataParamName, {
      getReadonlyFieldValidatorNameForModel: name => this.getReadonlyFieldValidatorNameForModel(name),
    });
    return {
      type: 'readonly-field-validator',
      validatorName: this.getReadonlyFieldValidatorNameForModel(modelName),
      prevDataParamName,
      nextDataParamName,
      predicate,
    };
  }

  private getReadonlyFieldValidatorNameForModel(modelName: string) {
    return this.config.readonlyFieldValidatorNamePattern.replace(
      RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN_PARAM,
      modelName
    );
  }
}

export function createRulesGenerator(config: RulesGeneratorConfig): RulesGenerator {
  return new RulesGeneratorImpl(config);
}
