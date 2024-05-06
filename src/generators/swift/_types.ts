import type { SwiftGenerationTarget } from '../../api/index.js';
import type { swift } from '../../platforms/swift/index.js';
import type { Schema } from '../../schema/index.js';

export interface SwiftTypealiasDeclaration {
  type: 'typealias';
  modelName: string;
  modelType: swift.Type;
  modelDocs: string | undefined;
}

export interface SwiftStringEnumDeclaration {
  type: 'string-enum';
  modelName: string;
  modelType: swift.StringEnum;
  modelDocs: string | undefined;
}

export interface SwiftIntEnumDeclaration {
  type: 'int-enum';
  modelName: string;
  modelType: swift.IntEnum;
  modelDocs: string | undefined;
}

export interface SwiftDiscriminatedUnionEnumDeclaration {
  type: 'discriminated-union-enum';
  modelName: string;
  modelType: swift.DiscriminatedUnionEnum;
  modelDocs: string | undefined;
}

export interface SwiftSimpleUnionEnumDeclaration {
  type: 'simple-union-enum';
  modelName: string;
  modelType: swift.SimpleUnionEnum;
  modelDocs: string | undefined;
}

export interface SwiftStructDeclaration {
  type: 'struct';
  modelName: string;
  modelType: swift.Struct;
  modelDocs: string | undefined;
}

export type SwiftDeclaration =
  | SwiftTypealiasDeclaration
  | SwiftStringEnumDeclaration
  | SwiftIntEnumDeclaration
  | SwiftDiscriminatedUnionEnumDeclaration
  | SwiftSimpleUnionEnumDeclaration
  | SwiftStructDeclaration;

export interface SwiftGeneration {
  type: 'swift';
  declarations: SwiftDeclaration[];
}

export interface SwiftGeneratorConfig {
  target: SwiftGenerationTarget;
}

export interface SwiftGenerator {
  generate(s: Schema): SwiftGeneration;
}
