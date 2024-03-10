import { StringBuilder } from '@proficient/ds';

import { createGenerationOutput } from '../../implementations/GenerationOutputImpl';
import type { Generator, PythonGeneratorConfig } from '../../interfaces';
import { python } from '../../platforms/python';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import { multiply } from '../../util/multiply-str';
import { space } from '../../util/space';
import { processSchema } from './process-schema';

class PythonGeneratorImpl implements Generator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  public async generate(s: schema.Schema) {
    const processedSchema = processSchema(s);
    const { models } = processedSchema;

    const b = new StringBuilder();

    b.append(`${this.generateImportStatements()}\n\n`);
    b.append(`${this.generateStaticDeclarations()}\n`);
    b.append(`# Model Definitions\n\n`);

    const { aliasModels, documentModels } = this.divideModelsByType(models);

    aliasModels.forEach(model => {
      // TODO: Add doc comment
      if (model.value.type === 'enum') {
        const declaration = this.generateClassDeclarationForEnum(model.name, model.value);
        b.append(declaration);
      } else if (model.value.type === 'map') {
        const declaration = this.generateClassDeclarationForMap(model.name, model.value);
        b.append(declaration);
      } else {
        const { expression } = python.schema.fromExpressibleType(model.value);
        b.append(`${model.name} = ${expression.content}\n\n`);
      }
    });

    documentModels.forEach(model => {
      // TODO: Add doc comment
      b.append(`class ${model.name}(pydantic.BaseModel):\n`);
      model.fields.forEach(field => {
        if (field.optional) {
          if (field.type.type === 'union') {
            const pyType = python.schema.fromExpressibleUnionType(field.type);
            pyType.addMember(python.UNDEFINED);
            const { expression } = pyType;
            b.append(`${this.indent(1)}${field.name}: ${expression.content} = UNDEFINED\n`);
          } else {
            const pyType = python.schema.fromExpressibleUnionType({ type: 'union', members: [field.type] });
            pyType.addMember(python.UNDEFINED);
            const { expression } = pyType;
            b.append(`${this.indent(1)}${field.name}: ${expression.content} = UNDEFINED\n`);
          }
        } else {
          const pyType = python.schema.fromExpressibleType(field.type);
          const { expression } = pyType;
          b.append(`${this.indent(1)}${field.name}: ${expression.content}\n`);
        }
      });
      b.append('\n');
      b.append(`${this.indent(1)}def __setattr__(self, name: str, value: typing.Any) -> None:\n`);
      // TODO: For every optional that is not nullable prevent assignment to None
      b.append(`${this.indent(2)}super().__setattr__(name, value)\n\n`);
      b.append(`${this.indent(1)}def model_dump(self, **kwargs) -> typing.Dict[str, typing.Any]:\n`);
      // TODO: Remove every optional field set to UNDEFINED
      b.append(`${this.indent(2)}model_dict = super().model_dump(**kwargs)\n`);
      b.append(`${this.indent(2)}return model_dict\n\n`);
      b.append(`${this.indent(1)}class Config:\n`);
      b.append(`${this.indent(2)}use_enum_values = True\n`);
    });

    return createGenerationOutput(b.toString());
  }

  private divideModelsByType(models: python.schema.ExpressibleModel[]) {
    const aliasModels: python.schema.ExpressibleAliasModel[] = [];
    const documentModels: python.schema.ExpressibleDocumentModel[] = [];
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

  private generateImportStatements() {
    const b = new StringBuilder();
    b.append(`from __future__ import annotations\n\n`);
    b.append(`import typing\n`);
    b.append(`import datetime\n`);
    b.append(`import enum\n`);
    b.append(`import pydantic`);
    return b.toString();
  }

  private generateStaticDeclarations() {
    const b = new StringBuilder();
    b.append(`class TypeSyncUndefined:\n`);
    b.append(`${this.indent(1)}_instance = None\n\n`);
    b.append(`${this.indent(1)}def __init__(self):\n`);
    b.append(`${this.indent(2)}if TypeSyncUndefined._instance is not None:\n`);
    b.append(
      `${this.indent(3)}raise RuntimeError("TypeSyncUndefined instances cannot be created directly. Use UNDEFINED instead.")\n`
    );
    b.append(`${this.indent(2)}else:\n`);
    b.append(`${this.indent(3)}TypeSyncUndefined._instance = self\n\n`);
    b.append(`UNDEFINED = TypeSyncUndefined()\n`);
    return b.toString();
  }

  private generateClassDeclarationForEnum(name: string, pyType: schema.types.Enum) {
    const b = new StringBuilder();
    b.append(`class ${name}(enum.Enum):\n`);
    pyType.items.forEach(item => {
      b.append(`${this.indent(1)}${item.label} = `);
      const valueAsString = (() => {
        switch (typeof item.value) {
          case 'string':
            return `"${item.value}"`;
          case 'number':
            return `${item.value}`;
          default:
            assertNever(item.value);
        }
      })();
      b.append(`${valueAsString}\n`);
    });
    b.append(`\n`);
    return b.toString();
  }

  private generateClassDeclarationForMap(name: string, vt: schema.types.Map) {
    const b = new StringBuilder();
    b.append(`class ${name}(pydantic.BaseModel):\n`);
    vt.fields.forEach(field => {
      // TODO: Getting this expression is not possible is the inner types may not be "expressible"
      // TODO: Process and edit the schema to make all nested fields expressible and generate enums and maps where needed
      const expression = '';
      b.append(`${this.indent(1)}${field.name}: ${expression}\n`);
    });
    b.append('\n');
    return b.toString();
  }

  private indent(count: number) {
    return multiply(space(this.config.indentation), count);
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): Generator {
  return new PythonGeneratorImpl(config);
}
