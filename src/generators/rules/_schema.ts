import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from '../../schema/abstract.js';
import type {
  AliasModel,
  DiscriminatedUnionType,
  DocumentModel,
  ListType,
  MapType,
  ObjectFieldType,
  ObjectType,
  Schema,
  SimpleUnionType,
  TupleType,
} from '../../schema/generic.js';
import type { schema } from '../../schema/index.js';

export type FlatPrimitive =
  | schema.types.Unknown
  | schema.types.String
  | schema.types.Boolean
  | schema.types.Integer
  | schema.types.Double
  | schema.types.Timestamp;

export type FlatType =
  | FlatPrimitive
  | schema.types.Literal
  | schema.types.Enum
  | FlatTupleType
  | FlatListType
  | FlatMapType
  | FlatObjectType
  | FlatDiscriminatedUnionType
  | FlatSimpleUnionType
  | schema.types.Alias;

export type FlatTupleType = TupleType<FlatType>;
export type FlatListType = ListType<FlatType>;
export type FlatMapType = MapType<FlatType>;
export type FlatObjectType = ObjectType<FlatType>;
export type FlatObjectFieldType = ObjectFieldType<FlatType>;
export type FlatDiscriminatedUnionType = DiscriminatedUnionType<schema.types.Alias | FlatObjectType>;
export type FlatSimpleUnionType = SimpleUnionType<FlatType>;
export type FlatAliasModel = AliasModel<FlatType>;
export type FlatDocumentModel = DocumentModel<FlatObjectType>;
export type FlatModel = FlatAliasModel | FlatDocumentModel;
export type FlatSchema = Schema<FlatAliasModel, FlatDocumentModel>;

class FlatSchemaImpl extends AbstractSchema<FlatAliasModel, FlatDocumentModel> implements FlatSchema {
  public clone() {
    return this.cloneModels(new FlatSchemaImpl());
  }
}

class FlatAliasModelImpl extends AbstractAliasModel<FlatType> implements FlatAliasModel {
  public clone() {
    return new FlatAliasModelImpl(this.name, this.docs, this.cloneType());
  }
}

class FlatDocumentModelImpl extends AbstractDocumentModel<FlatObjectType> implements FlatDocumentModel {
  public clone() {
    return new FlatDocumentModelImpl(this.name, this.docs, this.cloneType());
  }
}

interface CreateFlatAliasModelParams {
  name: string;
  docs: string | undefined;
  type: FlatType;
}

export function createFlatAliasModel(params: CreateFlatAliasModelParams): FlatAliasModel {
  return new FlatAliasModelImpl(params.name, params.docs, params.type);
}

interface CreateFlatDocumentModelParams {
  name: string;
  docs: string | undefined;
  type: FlatObjectType;
}
export function createFlatDocumentModel(params: CreateFlatDocumentModelParams): FlatDocumentModel {
  return new FlatDocumentModelImpl(params.name, params.docs, params.type);
}

export function createFlatSchema(): FlatSchema {
  return new FlatSchemaImpl();
}
