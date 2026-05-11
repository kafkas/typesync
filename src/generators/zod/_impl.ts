import { ZOD_INFERRED_TYPE_NAME_PATTERN_PARAM, ZOD_SCHEMA_NAME_PATTERN_PARAM } from '../../constants.js';
import { buildZodFromType, createCodegenZodEmitter } from '../../core/zod/index.js';
import { schema } from '../../schema/index.js';
import { typeUsesBytes, typeUsesTimestamp } from './_type-traversal.js';
import type { ZodGeneration, ZodGenerator, ZodGeneratorConfig, ZodSchemaDeclaration } from './_types.js';

class ZodGeneratorImpl implements ZodGenerator {
  public constructor(private readonly config: ZodGeneratorConfig) {}

  public generate(s: schema.Schema): ZodGeneration {
    const emitter = createCodegenZodEmitter({
      variant: this.config.variant,
      target: this.config.target,
      getSchemaIdentifierForModel: name => this.getSchemaIdentifierForModel(name),
    });

    const declarations: ZodSchemaDeclaration[] = [];

    s.aliasModels.forEach(model => {
      declarations.push(this.createDeclaration(model, 'alias', emitter));
    });

    s.documentModels.forEach(model => {
      declarations.push(this.createDeclaration(model, 'document', emitter));
    });

    const usesTimestamp = this.schemaUses(s, typeUsesTimestamp);
    const usesBytes = this.schemaUses(s, typeUsesBytes);

    return {
      type: 'zod',
      declarations,
      usesTimestamp,
      usesBytes,
    };
  }

  private createDeclaration(
    model: { name: string; docs: string | null; type: schema.types.Type },
    modelKind: 'alias' | 'document',
    emitter: ReturnType<typeof createCodegenZodEmitter>
  ): ZodSchemaDeclaration {
    const expression = this.attachModelDocs(buildZodFromType(model.type, emitter), model.docs);
    return {
      type: 'schema',
      modelName: model.name,
      schemaName: this.getSchemaIdentifierForModel(model.name),
      inferredTypeName: this.config.emitInferredTypes ? this.getInferredTypeIdentifierForModel(model.name) : null,
      modelDocs: model.docs,
      expression,
      modelKind,
    };
  }

  private attachModelDocs(expression: string, docs: string | null): string {
    if (docs === null || docs.length === 0) return expression;
    return `${expression}.describe(${JSON.stringify(docs)})`;
  }

  private getSchemaIdentifierForModel(modelName: string): string {
    return this.config.schemaNamePattern.replace(ZOD_SCHEMA_NAME_PATTERN_PARAM, modelName);
  }

  private getInferredTypeIdentifierForModel(modelName: string): string {
    return this.config.inferredTypeNamePattern.replace(ZOD_INFERRED_TYPE_NAME_PATTERN_PARAM, modelName);
  }

  private schemaUses(s: schema.Schema, predicate: (t: schema.types.Type) => boolean): boolean {
    return s.aliasModels.some(m => predicate(m.type)) || s.documentModels.some(m => predicate(m.type));
  }
}

export function createZodGenerator(config: ZodGeneratorConfig): ZodGenerator {
  return new ZodGeneratorImpl(config);
}
