import { StringBuilder } from '@proficient/ds';

import type { Generator, PythonGeneratorConfig } from '../../../interfaces';
import { python } from '../../../platforms/python';
import { schema } from '../../../schema';
import { divideModelsByType } from '../../../util/divide-models-by-type';
import { multiply } from '../../../util/multiply-str';
import { space } from '../../../util/space';
import { createGenerationOutput } from '../../GenerationOutputImpl';

export class PythonGeneratorImpl implements Generator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  public async generate(s: schema.Schema) {
    const { models } = s;
    const { indentation } = this.config;

    const b = new StringBuilder();

    b.append(`${this.generateImportStatements()}\n\n`);
    b.append(`${this.generateStaticDeclarations()}\n`);
    b.append(`# Model Definitions\n\n`);

    const { aliasModels, documentModels } = divideModelsByType(models);

    aliasModels.forEach(model => {
      // TODO: Add doc comment
      if (model.value.type === 'enum') {
        const pyType = python.fromEnumValueType(model.value);
        const declaration = this.generateClassDeclarationForEnum(model.name, pyType);
        b.append(declaration);
      } else if (model.value.type === 'map') {
        const pyType = python.fromMapValueType(model.value);
        const declaration = this.generateClassDeclarationForMap(model.name, pyType);
        b.append(declaration);
      } else {
        const pyType = python.fromValueType(model.value);
        b.append(`${model.name} = ${pyType.toString(indentation)}\n\n`);
      }
    });

    documentModels.forEach(model => {
      // TODO: Add doc comment
      b.append(`class ${model.name}(pydantic.BaseModel):\n`);
      model.fields.forEach(field => {
        if (field.optional) {
          if (field.type.type === 'union') {
            const pyType = python.fromUnionValueType(field.type);
            pyType.addMember(python.UNDEFINED);
            b.append(`${this.indent(1)}${field.name}: ${pyType.toString(indentation)} = UNDEFINED\n`);
          } else {
            const pyType = python.fromUnionValueType({ type: 'union', members: [field.type] });
            pyType.addMember(python.UNDEFINED);
            b.append(`${this.indent(1)}${field.name}: ${pyType.toString(indentation)} = UNDEFINED\n`);
          }
        } else {
          const pyType = python.fromValueType(field.type);
          b.append(`${this.indent(1)}${field.name}: ${pyType.toString(indentation)}\n`);
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

  private generateClassDeclarationForEnum(name: string, pyType: python.EnumValueType) {
    const b = new StringBuilder();
    b.append(`class ${name}(enum.Enum):\n`);
    pyType.items.forEach(item => {
      b.append(`${this.indent(1)}${item.label} = ${typeof item.value === 'string' ? `"${item.value}"` : item.value}\n`);
    });
    b.append(`\n`);
    return b.toString();
  }

  private generateClassDeclarationForMap(name: string, pyType: python.MapValueType) {
    const { indentation } = this.config;
    const b = new StringBuilder();
    b.append(`class ${name}(pydantic.BaseModel):\n`);
    pyType.fields.forEach(field => {
      b.append(`${this.indent(1)}${field.name}: ${field.type.toString(indentation)}\n`);
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
