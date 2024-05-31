import {
  RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN_PARAM,
  RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM,
} from '../../constants.js';
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
    modelType: schema.rules.types.Object,
    s: schema.rules.Schema
  ): RulesReadonlyFieldValidatorDeclaration {
    const {
      readonlyFieldValidatorPrevDataParamName: prevDataParamName,
      readonlyFieldValidatorNextDataParamName: nextDataParamName,
    } = this.config;
    return {
      type: 'readonly-field-validator',
      validatorName: this.getReadonlyFieldValidatorNameForModel(modelName),
      prevDataParamName,
      nextDataParamName,
      predicate: this.getReadonlyFieldPredicateForObjectType(modelType, s, prevDataParamName, nextDataParamName),
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
    return {
      type: 'readonly-field-validator',
      validatorName: this.getReadonlyFieldValidatorNameForModel(modelName),
      prevDataParamName,
      nextDataParamName,
      predicate: this.getReadonlyFieldPredicateForObjectType(modelType, s, prevDataParamName, nextDataParamName),
    };
  }

  private getReadonlyFieldPredicateForObjectType(
    t: schema.rules.types.Object,
    s: schema.rules.Schema,
    prevDataParam: string,
    nextDataParam: string
  ): rules.Predicate {
    // TODO: Make dynamic
    const innerPredicates: rules.Predicate[] = [];

    const readonlyKeys = t.fields.filter(field => field.readonly).map(field => field.name);
    if (readonlyKeys.length > 0) {
      innerPredicates.push({ type: 'map-diff-has-affected-keys', prevDataParam, nextDataParam, keys: readonlyKeys });
    }

    t.fields.forEach(field => {
      if (field.type.type === 'alias') {
        const aliasModel = s.getAliasModel(field.type.name);
        if (aliasModel?.type.type === 'object') {
          // TODO: What about other types like union?
          innerPredicates.push({
            type: 'readonly-field-validator',
            validatorName: this.getReadonlyFieldValidatorNameForModel(field.type.name),
            prevDataParam: `${prevDataParam}.${field.name}`,
            nextDataParam: `${nextDataParam}.${field.name}`,
          });
        }
      } else if (field.type.type === 'object') {
        const objectPredicate = this.getReadonlyFieldPredicateForObjectType(
          field.type,
          s,
          `${prevDataParam}.${field.name}`,
          `${nextDataParam}.${field.name}`
        );
        innerPredicates.push(objectPredicate);
      }
      // TODO: What about other types like union?
    });
    return {
      type: 'or',
      alignment: 'vertical',
      innerPredicates,
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
