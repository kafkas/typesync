import type { TSGenerationPlatform } from './public';

export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export type SchemaPrimitiveValueType = {
  type: 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';
};

export type SchemaAliasValueType = {
  type: 'alias';
  name: string;
};

export type SchemaEnumValueType = {
  type: 'enum';
  items: {
    label: string;
    value: string | number;
  }[];
};

export type SchemaMapValueType = {
  type: 'map';
  fields: SchemaModelField[];
};

export type SchemaValueType =
  | SchemaPrimitiveValueType
  | SchemaAliasValueType
  | SchemaEnumValueType
  | SchemaMapValueType;

export interface SchemaModelField {
  type: SchemaValueType;
  optional: boolean;
  name: string;
  docs: string | undefined;
}

export interface SchemaDocumentModel {
  type: 'document';
  name: string;
  docs: string | undefined;
  fields: SchemaModelField[];
}

export interface SchemaAliasModel {
  type: 'alias';
  name: string;
  docs: string | undefined;
  value: SchemaValueType;
}

export type SchemaModel = SchemaDocumentModel | SchemaAliasModel;

export interface Schema {
  models: SchemaModel[];
}

export interface DefinitionParser {
  parseDefinition(pathToDefinition: string): Schema;
}

export interface TSGeneratorConfig {
  platform: TSGenerationPlatform;
  /**
   * The number of spaces for each indentation.
   */
  indentation: number;
}

export interface GenerationOutput {
  toString(): string;
}

export interface Generator {
  generate(schema: Schema): Promise<GenerationOutput>;
}
