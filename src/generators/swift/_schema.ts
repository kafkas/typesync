import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from '../../schema/abstract.js';
import type {
  AliasModel,
  DocumentModel,
  ListType,
  MapType,
  ObjectFieldType,
  ObjectType,
  Schema,
  TupleType,
} from '../../schema/generic.js';
import type { schema } from '../../schema/index.js';

export type FlatType =
  | schema.types.Primitive
  | schema.types.Literal
  | FlatTupleType
  | FlatListType
  | FlatMapType
  | schema.types.Alias;

export type FlatTupleType = TupleType<FlatType>;
export type FlatListType = ListType<FlatType>;
export type FlatMapType = MapType<FlatType>;
export type FlatObjectType = ObjectType<FlatType>;
export type FlatObjectFieldType = ObjectFieldType<FlatType>;
export type FlatAliasModel = AliasModel<FlatType | FlatObjectType | schema.types.Enum>;
export type FlatDocumentModel = DocumentModel<FlatObjectType>;
export type FlatModel = FlatAliasModel | FlatDocumentModel;
export type FlatSchema = Schema<FlatAliasModel, FlatDocumentModel>;

class FlatSchemaImpl extends AbstractSchema<FlatAliasModel, FlatDocumentModel> implements FlatSchema {
  public clone() {
    return this.cloneModels(new FlatSchemaImpl());
  }
}

class FlatAliasModelImpl
  extends AbstractAliasModel<FlatType | FlatObjectType | schema.types.Enum>
  implements FlatAliasModel
{
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
  type: FlatType | FlatObjectType | schema.types.Enum;
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
