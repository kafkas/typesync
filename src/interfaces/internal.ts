export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export type SchemaValueType =
  | {
      type: 'string' | 'boolean' | 'int';
    }
  | {
      type: 'alias';
      name: string;
    }
  | {
      type: 'enum';
      items: {
        label: string;
        value: string | number;
      }[];
    };

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

export interface GenerationOutput {
  toString(): string;
}

export interface Generator {
  generate(schema: Schema): Promise<GenerationOutput>;
}
