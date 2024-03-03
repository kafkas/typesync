export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export type SchemaModelFieldJson = {
  type: 'string' | 'boolean' | 'int';
  optional?: boolean;
};

export type SchemaModelJson = {
  fields: Record<string, SchemaModelFieldJson>;
};

export type SchemaJson = {
  models: Record<string, SchemaModelJson>;
};

export interface Schema {}

export interface SchemaParser {
  parseSchema(pathToSchema: string): Schema;
}

export interface GenerationOutput {
  toString(): string;
}

export interface Generator {
  generate(schema: Schema): Promise<GenerationOutput>;
}
