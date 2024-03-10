import { StringBuilder } from '@proficient/ds';

import { createGenerationOutput } from '../../implementations/GenerationOutputImpl';
import type { Generator, TSGeneratorConfig } from '../../interfaces';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import { space } from '../../util/space';

class TSGeneratorImpl implements Generator {
  private get firestore() {
    switch (this.config.platform) {
      case 'ts:firebase-admin:11':
        return 'firestore';
      default:
        assertNever(this.config.platform);
    }
  }

  public constructor(private readonly config: TSGeneratorConfig) {}

  public async generate(s: schema.Schema) {
    const { models } = s;

    const builder = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();

    builder.append(`${tsFirestoreImport}\n\n`);

    const { aliasModels, documentModels } = this.divideModelsByType(models);

    aliasModels.forEach(model => {
      const tsType = this.getTSTypeForAliasModel(model, 0);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs, 0);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export type ${model.name} = ${tsType};\n\n`);
    });

    documentModels.forEach((model, modelIndex) => {
      // A Firestore document can be considered a 'map' type
      const tsType = this.getTSTypeForMapValueType({ type: 'map', fields: model.fields }, 0);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs, 0);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export interface ${model.name} ${tsType}\n`);
      if (modelIndex < documentModels.length - 1) {
        builder.append('\n');
      }
    });

    return createGenerationOutput(builder.toString());
  }

  private divideModelsByType(models: schema.Model[]) {
    const aliasModels: schema.AliasModel[] = [];
    const documentModels: schema.DocumentModel[] = [];
    models.forEach(model => {
      switch (model.type) {
        case 'alias':
          aliasModels.push(model);
          break;
        case 'document':
          documentModels.push(model);
          break;
        default:
          assertNever(model);
      }
    });
    return { aliasModels, documentModels };
  }

  private getImportFirestoreStatement() {
    switch (this.config.platform) {
      case 'ts:firebase-admin:11':
        return `import { firestore } from 'firebase-admin';`;
      default:
        assertNever(this.config.platform);
    }
  }

  private getTSTypeForAliasModel(model: schema.AliasModel, depth: number) {
    return this.getTSTypeForValueType(model.value, depth);
  }

  private getTSTypeForValueType(type: schema.types.Type, depth: number) {
    if (schema.isPrimitiveValueType(type)) {
      return this.getTSTypeForPrimitiveValueType(type);
    }
    switch (type.type) {
      case 'literal':
        return this.getTSTypeForLiteralValueType(type);
      case 'enum':
        return this.getTSTypeForEnumValueType(type);
      case 'tuple':
        return this.getTSTypeForTupleValueType(type, depth);
      case 'list':
        return this.getTSTypeForListValueType(type, depth);
      case 'map':
        return this.getTSTypeForMapValueType(type, depth);
      case 'union':
        return this.getTSTypeForUnionValueType(type, depth);
      case 'alias':
        return type.name;
      default:
        assertNever(type);
    }
  }

  private getTSTypeForPrimitiveValueType(type: schema.types.Primitive) {
    switch (type.type) {
      case 'nil':
        return 'null';
      case 'string':
        return 'string';
      case 'boolean':
        return 'boolean';
      case 'int':
        return 'number';
      case 'timestamp':
        return `${this.firestore}.Timestamp`;
      default:
        assertNever(type.type);
    }
  }

  private getTSTypeForLiteralValueType(type: schema.types.Literal) {
    switch (typeof type.value) {
      case 'string':
        return `'${type.value}'`;
      case 'number':
        return `${type.value}`;
      case 'boolean':
        return `${type.value}`;
      default:
        assertNever(type.value);
    }
  }

  private getTSTypeForEnumValueType(type: schema.types.Enum) {
    const { items } = type;
    return items
      .map(({ value }) => {
        switch (typeof value) {
          case 'string':
            return `'${value}'`;
          case 'number':
            return `${value}`;
          default:
            assertNever(value);
        }
      })
      .join(' | ');
  }

  private getTSTypeForTupleValueType(type: schema.types.Tuple, depth: number): string {
    const tsTypes = type.values.map(v => this.getTSTypeForValueType(v, depth)).join(', ');
    return `[${tsTypes}]`;
  }

  private getTSTypeForListValueType(type: schema.types.List, depth: number): string {
    const tsType = this.getTSTypeForValueType(type.of, depth);
    return `${tsType}[]`;
  }

  private getTSTypeForMapValueType(type: schema.types.Map, depth: number) {
    const { fields } = type;
    const builder = new StringBuilder();

    builder.append(`{\n`);
    fields.forEach(field => {
      if (field.docs !== undefined) {
        const tsDoc = this.buildTSDoc(field.docs, depth + 1);
        builder.append(`${tsDoc}\n`);
      }

      builder.append(space(this.config.indentation * (1 + depth)));

      const tsType = this.getTSTypeForValueType(field.type, depth + 1);
      builder.append(`${field.name}${field.optional ? '?' : ''}: ${tsType};\n`);
    });

    builder.append(space(this.config.indentation * depth));
    builder.append(`}`);

    return builder.toString();
  }

  private getTSTypeForUnionValueType(type: schema.types.Union, depth: number) {
    const tsTypes: string[] = type.members.map(memberValueType => {
      return this.getTSTypeForValueType(memberValueType, depth);
    });

    return tsTypes.join(' | ');
  }

  private buildTSDoc(docs: string, depth: number) {
    const spaces = space(this.config.indentation * depth);
    return `${spaces}/**\n${spaces} * ${docs}\n${spaces} */`;
  }
}

export function createTSGenerator(config: TSGeneratorConfig): Generator {
  return new TSGeneratorImpl(config);
}
