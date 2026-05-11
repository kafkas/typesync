import { ZOD_SCHEMA_NAME_PATTERN_PARAM } from '../../constants.js';
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
      const expression = this.attachModelDocs(buildZodFromType(model.type, emitter), model.docs);
      declarations.push({
        type: 'schema',
        modelName: model.name,
        schemaName: this.getSchemaIdentifierForModel(model.name),
        modelDocs: model.docs,
        expression,
        modelKind: 'alias',
      });
    });

    s.documentModels.forEach(model => {
      const expression = this.attachModelDocs(buildZodFromType(model.type, emitter), model.docs);
      declarations.push({
        type: 'schema',
        modelName: model.name,
        schemaName: this.getSchemaIdentifierForModel(model.name),
        modelDocs: model.docs,
        expression,
        modelKind: 'document',
      });
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

  private attachModelDocs(expression: string, docs: string | null): string {
    if (docs === null || docs.length === 0) return expression;
    return `${expression}.describe(${JSON.stringify(docs)})`;
  }

  private getSchemaIdentifierForModel(modelName: string): string {
    return this.config.schemaNamePattern.replace(ZOD_SCHEMA_NAME_PATTERN_PARAM, modelName);
  }

  private schemaUses(s: schema.Schema, predicate: (t: schema.types.Type) => boolean): boolean {
    return s.aliasModels.some(m => predicate(m.type)) || s.documentModels.some(m => predicate(m.type));
  }
}

export function createZodGenerator(config: ZodGeneratorConfig): ZodGenerator {
  return new ZodGeneratorImpl(config);
}
