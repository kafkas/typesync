export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export type SchemaModelFieldJson = {
  type: 'string' | 'boolean' | 'int';
  optional?: boolean;
  docs?: string;
};

export type SchemaModelJson = {
  docs?: string;
  fields: Record<string, SchemaModelFieldJson>;
};

export type SchemaJson = Record<string, SchemaModelJson>;

export interface SchemaModelField {
  type: 'string' | 'boolean' | 'int';
  optional: boolean;
  name: string;
  docs: string | undefined;
}

export interface SchemaModel {
  name: string;
  docs: string | undefined;
  fields: SchemaModelField[];
}

export interface Schema {
  models: SchemaModel[];
}

export interface SchemaParser {
  parseSchema(pathToSchema: string): Schema;
}

export interface GenerationOutput {
  toString(): string;
}

export interface Generator {
  generate(schema: Schema): Promise<GenerationOutput>;
}
